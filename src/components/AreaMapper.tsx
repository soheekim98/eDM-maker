"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { useEdmStore } from "@/hooks/useEdmStore";
import AreaEditDialog from "./AreaEditDialog";

export default function AreaMapper() {
  const {
    sourceImageDataUrl,
    imageWidth,
    imageHeight,
    sliceLines,
    clickAreas,
    addClickArea,
    updateClickArea,
    removeClickArea,
  } = useEdmStore();

  const sliceRanges = useMemo(() => {
    const ys = [0, ...sliceLines.map((l) => l.y), imageHeight];
    return ys.slice(0, -1).map((startY, i) => ({
      index: i,
      startY,
      height: ys[i + 1] - startY,
    }));
  }, [sliceLines, imageHeight]);

  if (!sourceImageDataUrl) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">
        클릭 영역 매핑{" "}
        <span className="text-sm font-normal text-gray-400">
          (각 슬라이스에서 드래그하여 영역 추가)
        </span>
      </h3>

      {sliceRanges.map((slice) => {
        const areas = clickAreas.filter((a) => a.sliceIndex === slice.index);
        return (
          <SliceAreaEditor
            key={slice.index}
            sliceIndex={slice.index}
            startY={slice.startY}
            sliceHeight={slice.height}
            imageWidth={imageWidth}
            imageSrc={sourceImageDataUrl}
            areas={areas}
            onAddArea={addClickArea}
            onUpdateArea={updateClickArea}
            onRemoveArea={removeClickArea}
          />
        );
      })}
    </div>
  );
}

interface SliceAreaEditorProps {
  sliceIndex: number;
  startY: number;
  sliceHeight: number;
  imageWidth: number;
  imageSrc: string;
  areas: ReturnType<typeof useEdmStore.getState>["clickAreas"];
  onAddArea: (area: {
    sliceIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    href: string;
    alt: string;
  }) => void;
  onUpdateArea: (id: string, updates: Record<string, unknown>) => void;
  onRemoveArea: (id: string) => void;
}

function SliceAreaEditor({
  sliceIndex,
  startY,
  sliceHeight,
  imageWidth,
  imageSrc,
  areas,
  onAddArea,
  onUpdateArea,
  onRemoveArea,
}: SliceAreaEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const maxDisplayWidth = 800;
  const scaleFactor = Math.min(maxDisplayWidth, imageWidth) / imageWidth;
  const displayWidth = imageWidth * scaleFactor;
  const displayHeight = sliceHeight * scaleFactor;

  const getLocalCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: Math.round((clientX - rect.left) / scaleFactor),
        y: Math.round((clientY - rect.top) / scaleFactor),
      };
    },
    [scaleFactor]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-area-rect]")) return;
      const coords = getLocalCoords(e.clientX, e.clientY);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDrawing({
        startX: coords.x,
        startY: coords.y,
        currentX: coords.x,
        currentY: coords.y,
      });
    },
    [getLocalCoords]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drawing) return;
      const coords = getLocalCoords(e.clientX, e.clientY);
      setDrawing((prev) =>
        prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null
      );
    },
    [drawing, getLocalCoords]
  );

  const handlePointerUp = useCallback(() => {
    if (!drawing) return;
    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const w = Math.abs(drawing.currentX - drawing.startX);
    const h = Math.abs(drawing.currentY - drawing.startY);

    if (w > 5 && h > 5) {
      onAddArea({
        sliceIndex,
        x,
        y,
        width: w,
        height: h,
        href: "",
        alt: "",
      });
    }
    setDrawing(null);
  }, [drawing, sliceIndex, onAddArea]);

  const drawRect = drawing
    ? {
        x: Math.min(drawing.startX, drawing.currentX),
        y: Math.min(drawing.startY, drawing.currentY),
        w: Math.abs(drawing.currentX - drawing.startX),
        h: Math.abs(drawing.currentY - drawing.startY),
      }
    : null;

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="text-sm font-medium text-gray-600 mb-2">
        슬라이스 {sliceIndex + 1} ({sliceHeight}px)
        {areas.length > 0 && (
          <span className="ml-2 text-blue-500">영역 {areas.length}개</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative select-none border border-gray-200 rounded overflow-hidden mx-auto"
        style={{ width: displayWidth, height: displayHeight }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Slice image using CSS clip */}
        <div
          style={{
            width: imageWidth * scaleFactor,
            height: sliceHeight * scaleFactor,
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={`슬라이스 ${sliceIndex + 1}`}
            style={{
              display: "block",
              width: imageWidth * scaleFactor,
              marginTop: -startY * scaleFactor,
            }}
            draggable={false}
          />
        </div>

        {/* Existing areas */}
        {areas.map((area) => (
          <div
            key={area.id}
            data-area-rect
            className="absolute border-2 border-blue-500 bg-blue-500/20 hover:bg-blue-500/30 transition-colors pointer-events-none"
            style={{
              left: area.x * scaleFactor,
              top: area.y * scaleFactor,
              width: area.width * scaleFactor,
              height: area.height * scaleFactor,
            }}
          >
            <span className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-1 leading-4 truncate max-w-full">
              {area.alt || area.href || "미설정"}
            </span>
          </div>
        ))}

        {/* Drawing rect */}
        {drawRect && drawRect.w > 0 && drawRect.h > 0 && (
          <div
            className="absolute border-2 border-dashed border-green-500 bg-green-500/20 pointer-events-none"
            style={{
              left: drawRect.x * scaleFactor,
              top: drawRect.y * scaleFactor,
              width: drawRect.w * scaleFactor,
              height: drawRect.h * scaleFactor,
            }}
          />
        )}
      </div>

      {/* All area edit forms always visible */}
      {areas.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {areas.map((area) => (
            <AreaEditDialog
              key={area.id}
              area={area}
              onUpdate={(updates) => onUpdateArea(area.id, updates)}
              onDelete={() => onRemoveArea(area.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
