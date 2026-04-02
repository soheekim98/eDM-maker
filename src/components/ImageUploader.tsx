"use client";

import { useCallback } from "react";
import { useEdmStore } from "@/hooks/useEdmStore";

export default function ImageUploader() {
  const { sourceImageDataUrl, imageWidth, imageHeight, setSourceImage, resetAll } =
    useEdmStore();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setSourceImage(dataUrl, img.naturalWidth, img.naturalHeight);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [setSourceImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (sourceImageDataUrl) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-green-700 font-medium">
          이미지 로드 완료: {imageWidth} x {imageHeight}px
        </span>
        <button
          onClick={resetAll}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          초기화
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm">PNG, JPG 등 이미지 파일</p>
        </div>
      </label>
    </div>
  );
}
