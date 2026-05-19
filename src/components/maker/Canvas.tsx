"use client";

import { forwardRef, useCallback } from "react";
import { useMakerStore } from "@/hooks/useMakerStore";
import CanvasElementView from "./CanvasElementView";

const Canvas = forwardRef<HTMLDivElement>(function Canvas(_, ref) {
  const canvasWidth = useMakerStore((s) => s.canvasWidth);
  const canvasHeight = useMakerStore((s) => s.canvasHeight);
  const pageMargin = useMakerStore((s) => s.pageMargin);
  const background = useMakerStore((s) => s.background);
  const elements = useMakerStore((s) => s.elements);
  const selectElement = useMakerStore((s) => s.selectElement);

  const handleBackgroundPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) selectElement(null);
    },
    [selectElement]
  );

  const bgStyle: React.CSSProperties =
    background.type === "image" && background.imageDataUrl
      ? {
          backgroundColor: background.color,
          backgroundImage: `url(${background.imageDataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: background.color };

  return (
    <div
      ref={ref}
      onPointerDown={handleBackgroundPointerDown}
      style={{
        position: "relative",
        width: canvasWidth,
        height: canvasHeight,
        overflow: "hidden",
        ...bgStyle,
      }}
      className="shadow-md select-none"
    >
      {/* Margin guide (non-interactive) */}
      {pageMargin > 0 && (
        <div
          data-export-hide="true"
          style={{
            position: "absolute",
            inset: pageMargin,
            border: "1px dashed rgba(37, 99, 235, 0.35)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {elements
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((el) => (
          <CanvasElementView key={el.id} element={el} />
        ))}
    </div>
  );
});

export default Canvas;
