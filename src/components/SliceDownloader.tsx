"use client";

import { useState, useCallback } from "react";
import { useEdmStore, getImagePrefix } from "@/hooks/useEdmStore";
import { sliceImage } from "@/lib/sliceImage";
import {
  downloadSlicesAsZip,
  downloadSingleSlice,
} from "@/lib/downloadUtils";

export default function SliceDownloader() {
  const { sourceImageDataUrl, imageWidth, imageHeight, sliceLines, edmOrder } =
    useEdmStore();
  const [sliceBlobs, setSliceBlobs] = useState<Blob[]>([]);
  const [slicing, setSlicing] = useState(false);

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
    } finally {
      setSlicing(false);
    }
  }, [sourceImageDataUrl, imageWidth, imageHeight, sliceLines]);

  if (!sourceImageDataUrl) return null;

  const getFilename = (index: number) => `${prefix}${index + 1}.png`;

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
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {sliceBlobs.length}개 슬라이스 생성 완료
            </span>
            <button
              onClick={() => downloadSlicesAsZip(sliceBlobs, prefix)}
              className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              ZIP 다운로드
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {sliceBlobs.map((blob, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(blob)}
                  alt={`슬라이스 ${i + 1}`}
                  className="h-12 border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600 flex-1">
                  {getFilename(i)} ({Math.round(blob.size / 1024)}KB)
                </span>
                <button
                  onClick={() => downloadSingleSlice(blob, i, prefix)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  다운로드
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
