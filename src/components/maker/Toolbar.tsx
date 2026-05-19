"use client";

import { useRef } from "react";
import { useMakerStore } from "@/hooks/useMakerStore";

function readImage(
  file: File
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () =>
        resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Toolbar() {
  const addText = useMakerStore((s) => s.addText);
  const addImage = useMakerStore((s) => s.addImage);
  const addRectangle = useMakerStore((s) => s.addRectangle);
  const addDivider = useMakerStore((s) => s.addDivider);
  const addTable = useMakerStore((s) => s.addTable);
  const addButton = useMakerStore((s) => s.addButton);
  const resetAll = useMakerStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file: File | null) => {
    if (!file) return;
    const { dataUrl, width, height } = await readImage(file);
    addImage(dataUrl, width, height);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={addText}
        className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
      >
        + 텍스트
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full px-3 py-2 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-900"
      >
        + 이미지
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleImageFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={addButton}
        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
      >
        + 버튼
      </button>
      <button
        type="button"
        onClick={addRectangle}
        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
      >
        + 사각형 / 배경 박스
      </button>
      <button
        type="button"
        onClick={addTable}
        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
      >
        + 표
      </button>
      <button
        type="button"
        onClick={addDivider}
        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
      >
        + 구분선
      </button>

      <button
        type="button"
        onClick={() => {
          if (confirm("모든 요소를 초기화할까요?")) resetAll();
        }}
        className="mt-4 w-full px-3 py-2 rounded-md border border-gray-300 text-xs text-gray-500 hover:bg-gray-50"
      >
        전체 초기화
      </button>
    </div>
  );
}
