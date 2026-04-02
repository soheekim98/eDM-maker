"use client";

import { useState, useCallback } from "react";
import { useEdmStore, getImagePrefix } from "@/hooks/useEdmStore";
import { sliceImage } from "@/lib/sliceImage";
import { downloadSlicesAsZip } from "@/lib/downloadUtils";

export default function SliceDownloader() {
  const { sourceImageDataUrl, imageWidth, imageHeight, sliceLines, edmOrder } =
    useEdmStore();
  const [sliceBlobs, setSliceBlobs] = useState<Blob[]>([]);
  const [slicing, setSlicing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const prefix = getImagePrefix(edmOrder);

  const handleSlice = useCallback(async () => {
    if (!sourceImageDataUrl) return;
    setSlicing(true);
    try {
      const blobs = await sliceImage(
        sourceImageDataUrl,
        imageWidth,
        imageHeight,
        sliceLines.map((l) => l.y)
      );
      setSliceBlobs(blobs);
      setSelected(new Set(blobs.map((_, i) => i)));
    } finally {
      setSlicing(false);
    }
  }, [sourceImageDataUrl, imageWidth, imageHeight, sliceLines]);

  if (!sourceImageDataUrl) return null;

  const getFilename = (index: number) => `${prefix}${index + 1}.png`;

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sliceBlobs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sliceBlobs.map((_, i) => i)));
    }
  };

  const downloadToFolder = async () => {
    const indices = Array.from(selected).sort((a, b) => a - b);
    if (indices.length === 0) return;

    try {
      // 폴더 선택 다이얼로그
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dirHandle = await (window as any).showDirectoryPicker();
      for (const i of indices) {
        const fileHandle = await dirHandle.getFileHandle(getFilename(i), { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(sliceBlobs[i]);
        await writable.close();
      }
      alert(`${indices.length}개 파일 저장 완료`);
    } catch (e: unknown) {
      // 사용자가 취소한 경우 무시
      if (e instanceof DOMException && e.name === "AbortError") return;
      throw e;
    }
  };

  const downloadSelectedAsZip = () => {
    const indices = Array.from(selected).sort((a, b) => a - b);
    const blobs = indices.map((i) => sliceBlobs[i]);
    const names = indices.map((i) => `${prefix}${i + 1}`);
    downloadSlicesAsZip(blobs, prefix, names);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">이미지 슬라이싱</h3>
        <button
          onClick={handleSlice}
          disabled={slicing}
          className="px-4 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {slicing ? "슬라이싱 중..." : "이미지 슬라이싱 실행"}
        </button>
      </div>

      {sliceBlobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">
              {sliceBlobs.length}개 슬라이스 ({selected.size}개 선택)
            </span>
            <button
              onClick={toggleAll}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {selected.size === sliceBlobs.length ? "전체 해제" : "전체 선택"}
            </button>
            <button
              onClick={downloadToFolder}
              disabled={selected.size === 0}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              폴더에 저장
            </button>
            <button
              onClick={downloadSelectedAsZip}
              disabled={selected.size === 0}
              className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
            >
              ZIP 다운로드
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {sliceBlobs.map((blob, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 border rounded cursor-pointer transition-colors ${
                  selected.has(i)
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200"
                }`}
                onClick={() => toggleSelect(i)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleSelect(i)}
                  className="w-4 h-4 accent-blue-500"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(blob)}
                  alt={`슬라이스 ${i + 1}`}
                  className="h-12 border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600 flex-1">
                  {getFilename(i)} ({Math.round(blob.size / 1024)}KB)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
