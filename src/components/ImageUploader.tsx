"use client";

import { useCallback } from "react";
import { useEdmStore } from "@/hooks/useEdmStore";

const TARGET_WIDTH = 800;

function downscaleToWidth(
  img: HTMLImageElement,
  targetWidth: number
): HTMLCanvasElement {
  const ratio = targetWidth / img.naturalWidth;
  const targetHeight = Math.round(img.naturalHeight * ratio);

  // Multi-step downscale (halve each pass) to preserve detail when the
  // source is much larger than the target. Browsers' single-pass downscale
  // can lose sharpness for 3x+ ratios.
  let srcCanvas: HTMLCanvasElement | HTMLImageElement = img;
  let curW = img.naturalWidth;
  let curH = img.naturalHeight;

  while (curW * 0.5 > targetWidth) {
    const nextW = Math.max(targetWidth, Math.floor(curW * 0.5));
    const nextH = Math.max(1, Math.floor((nextW / curW) * curH));
    const tmp = document.createElement("canvas");
    tmp.width = nextW;
    tmp.height = nextH;
    const ctx = tmp.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(srcCanvas, 0, 0, nextW, nextH);
    srcCanvas = tmp;
    curW = nextW;
    curH = nextH;
  }

  const final = document.createElement("canvas");
  final.width = targetWidth;
  final.height = targetHeight;
  const ctx = final.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);
  return final;
}

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
          if (img.naturalWidth === TARGET_WIDTH) {
            setSourceImage(dataUrl, img.naturalWidth, img.naturalHeight);
            return;
          }
          const canvas = downscaleToWidth(img, TARGET_WIDTH);
          const resizedDataUrl = canvas.toDataURL("image/png");
          setSourceImage(resizedDataUrl, canvas.width, canvas.height);
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
