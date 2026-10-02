"use server";

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary if credentials are provided in .env
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No file was selected." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. IF CLOUDINARY CONFIG EXISTS: Upload to Cloudinary CDN
    if (isCloudinaryConfigured) {
      return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "food_delivery_platform",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload failure:", error);
                resolve({ success: false, error: "Cloudinary upload failed." });
              } else {
                resolve({ success: true, url: result?.secure_url });
              }
            }
          )
          .end(buffer);
      });
    }

    // 2. FALLBACK MODE: Write file locally to public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean name to prevent file-path parsing errors
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${Date.now()}_${sanitizedName}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return {
      success: true,
      url: `/uploads/${filename}`,
    };
  } catch (error: any) {
    console.error("Image upload exception error:", error);
    return { success: false, error: error.message || "Failed to process image upload." };
  }
}
