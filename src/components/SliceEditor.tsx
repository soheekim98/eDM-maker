"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useEdmStore } from "@/hooks/useEdmStore";

export default function SliceEditor() {
  const {
    sourceImageDataUrl,
    imageWidth,
    imageHeight,
    sliceLines,
    addSliceLine,
    autoSlice800,
    clearSliceLines,
    moveSliceLine,
    removeSliceLine,
  } = useEdmStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [displayHeight, setDisplayHeight] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const maxDisplayWidth = 800;
  const scaleFactor = imageWidth > 0 ? Math.min(maxDisplayWidth, imageWidth) / imageWidth : 1;
  const displayWidth = imageWidth * scaleFactor;

  useEffect(() => {
    setDisplayHeight(imageHeight * scaleFactor);
  }, [imageHeight, scaleFactor]);

  const getPixelY = useCallback(
    (clientY: number) => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const relY = clientY - rect.top;
      const pixelY = Math.round(relY / scaleFactor);
      return Math.max(1, Math.min(pixelY, imageHeight - 1));
    },
    [scaleFactor, imageHeight]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const y = getPixelY(e.clientY);
      addSliceLine(y);
    },
    [getPixelY, addSliceLine]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, lineId: string) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDraggingId(lineId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingId) return;
      const y = getPixelY(e.clientY);
      moveSliceLine(draggingId, y);
    },
    [draggingId, getPixelY, moveSliceLine]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  if (!sourceImageDataUrl) return null;

  // Compute slices for labeling
  const sortedYs = [0, ...sliceLines.map((l) => l.y), imageHeight];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">
          슬라이스 편집{" "}
          <span className="text-sm font-normal text-gray-400">
            (더블클릭으로 라인 추가)
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={autoSlice800}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            800px 자동 분할
          </button>
          {sliceLines.length > 0 && (
            <button
              onClick={clearSliceLines}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              전체 삭제
            </button>
          )}
          <span className="text-sm text-gray-500">
            {sliceLines.length}개 라인 → {sliceLines.length + 1}개 슬라이스
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative select-none border border-gray-300 rounded overflow-hidden mx-auto"
        style={{ width: displayWidth, height: displayHeight }}
        onDoubleClick={handleDoubleClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sourceImageDataUrl}
          alt="원본 이미지"
          className="block w-full h-full"
          draggable={false}
        />

        {/* Slice lines */}
        {sliceLines.map((line) => (
          <div
            key={line.id}
            className="absolute left-0 w-full group"
            style={{
              top: line.y * scaleFactor - 1,
              height: 3,
              cursor: "row-resize",
              zIndex: 10,
            }}
            onPointerDown={(e) => handlePointerDown(e, line.id)}
          >
            {/* Visible line */}
            <div className="absolute inset-0 bg-red-500 opacity-70 group-hover:opacity-100" />

            {/* Wider hit area */}
            <div className="absolute -top-4 -bottom-4 left-0 right-0" />

            {/* Y label */}
            <div className="absolute left-2 -top-5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {line.y}px
            </div>

            {/* Delete button */}
            <button
              className="absolute right-2 -top-3 w-6 h-6 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                removeSliceLine(line.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              X
            </button>
          </div>
        ))}

        {/* Slice number labels */}
        {sortedYs.slice(0, -1).map((startY, i) => {
          const endY = sortedYs[i + 1];
          const midY = ((startY + endY) / 2) * scaleFactor;
          return (
            <div
              key={`label-${i}`}
              className="absolute right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded pointer-events-none"
              style={{ top: midY - 10 }}
            >
              {i + 1}번 ({endY - startY}px)
            </div>
          );
        })}
      </div>
    </div>
  );
}
