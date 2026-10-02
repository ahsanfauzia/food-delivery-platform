"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["CUSTOMER", "DELIVERY_PARTNER"]).default("CUSTOMER"),
});

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const role = (formData.get("role") as string) || "CUSTOMER";

  const validatedFields = registerSchema.safeParse({ name, email, password, phone, role });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: { email: ["Email already registered"] },
        success: false,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role as any,
      },
    });

    // If user registered as a Delivery Partner, create their profile
    if (role === "DELIVERY_PARTNER") {
      await prisma.deliveryPartner.create({
        data: {
          userId: user.id,
          status: "OFFLINE",
        },
      });
    }

    return { success: true, message: "Registration successful! Please login." };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: { message: ["Internal server error. Please try again."] },
      success: false,
    };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password.", success: false };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error: any) {
    // NextAuth v5 credentials signin failure yields specific error messages
    if (error.message && error.message.includes("CredentialsSignin")) {
      return { error: "Invalid email or password.", success: false };
    }
    return { error: "Something went wrong. Please check your credentials.", success: false };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
