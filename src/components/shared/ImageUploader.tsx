"use client";

import React, { useState, useTransition } from "react";
import { uploadImage } from "@/app/actions/upload";
import { UploadCloud, Loader2, Image as ImageIcon, Check } from "lucide-react";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  defaultValue?: string;
}

export default function ImageUploader({ onUploadComplete, defaultValue = "" }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadImage(formData);
      if (res.success && res.url) {
        setPreviewUrl(res.url);
        onUploadComplete(res.url);
      } else {
        setError(res.error || "Upload failed. Please try again.");
        setPreviewUrl(defaultValue); // Reset preview
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {/* Preview image */}
        <div className="h-16 w-16 rounded-xl border border-gray-250 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>

        {/* Upload field */}
        <div className="flex-grow">
          <label className="relative flex items-center justify-center px-4 py-3 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isPending}
              className="hidden"
            />
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-500">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                  <span className="text-orange-500 animate-pulse">Uploading file...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4 text-orange-500" />
                  <span>Choose image to upload</span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
      {previewUrl && !isPending && !error && (
        <p className="text-[10px] text-green-600 font-bold flex items-center">
          <Check className="h-3.5 w-3.5 mr-1" /> Image uploaded successfully!
        </p>
      )}
    </div>
  );
}
