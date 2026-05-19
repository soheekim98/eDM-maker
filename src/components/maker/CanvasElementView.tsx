"use client";

import { useRef } from "react";
import { useMakerStore } from "@/hooks/useMakerStore";
import type {
  ButtonElement,
  CanvasElement,
  DividerElement,
  ImageElement,
  RectangleElement,
  TableElement,
  TextElement,
} from "./types";

interface Props {
  element: CanvasElement;
}

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface DragState {
  mode: "move" | "resize";
  handle?: Handle;
  startMouseX: number;
  startMouseY: number;
  startElX: number;
  startElY: number;
  startElW: number;
  startElH: number;
}

const MIN_SIZE = 10;

export default function CanvasElementView({ element }: Props) {
  const selectedId = useMakerStore((s) => s.selectedId);
  const selectElement = useMakerStore((s) => s.selectElement);
  const updateElement = useMakerStore((s) => s.updateElement);
  const dragRef = useRef<DragState | null>(null);

  const isSelected = selectedId === element.id;

  const startDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    mode: "move" | "resize",
    handle?: Handle
  ) => {
    e.stopPropagation();
    selectElement(element.id);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      handle,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElX: element.x,
      startElY: element.y,
      startElW: element.width,
      startElH: element.height,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startMouseX;
    const dy = e.clientY - d.startMouseY;

    if (d.mode === "move") {
      updateElement(element.id, {
        x: Math.round(d.startElX + dx),
        y: Math.round(d.startElY + dy),
      });
      return;
    }

    // Resize: compute based on handle direction
    let nx = d.startElX;
    let ny = d.startElY;
    let nw = d.startElW;
    let nh = d.startElH;
    const h = d.handle!;

    if (h.includes("e")) nw = d.startElW + dx;
    if (h.includes("w")) {
      nw = d.startElW - dx;
      nx = d.startElX + dx;
    }
    if (h.includes("s")) nh = d.startElH + dy;
    if (h.includes("n")) {
      nh = d.startElH - dy;
      ny = d.startElY + dy;
    }

    if (nw < MIN_SIZE) {
      if (h.includes("w")) nx = d.startElX + (d.startElW - MIN_SIZE);
      nw = MIN_SIZE;
    }
    if (nh < MIN_SIZE) {
      if (h.includes("n")) ny = d.startElY + (d.startElH - MIN_SIZE);
      nh = MIN_SIZE;
    }

    updateElement(element.id, {
      x: Math.round(nx),
      y: Math.round(ny),
      width: Math.round(nw),
      height: Math.round(nh),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  };

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    cursor: "grab",
    outline: isSelected ? "2px solid #2563eb" : "none",
    outlineOffset: 0,
    boxSizing: "border-box",
  };

  return (
    <div
      style={wrapperStyle}
      onPointerDown={(e) => startDrag(e, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {element.type === "text" && <TextBody element={element} />}
      {element.type === "image" && <ImageBody element={element} />}
      {element.type === "rectangle" && <RectBody element={element} />}
      {element.type === "divider" && <DividerBody element={element} />}
      {element.type === "table" && <TableBody element={element} />}
      {element.type === "button" && <ButtonBody element={element} />}

      {isSelected && (
        <ResizeHandles
          onStart={(e, handle) => startDrag(e, "resize", handle)}
        />
      )}
    </div>
  );
}

function TextBody({ element }: { element: TextElement }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        fontFamily: "Pretendard, sans-serif",
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        color: element.color,
        textAlign: element.textAlign,
        lineHeight: element.lineHeight,
        letterSpacing: element.letterSpacing,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        pointerEvents: "none",
      }}
    >
      {element.content}
    </div>
  );
}

function ImageBody({ element }: { element: ImageElement }) {
  return (
    <img
      src={element.dataUrl}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: element.objectFit,
        pointerEvents: "none",
        display: "block",
      }}
      draggable={false}
    />
  );
}

function RectBody({ element }: { element: RectangleElement }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: element.fillColor,
        borderRadius: element.borderRadius,
        border:
          element.borderWidth > 0
            ? `${element.borderWidth}px solid ${element.borderColor}`
            : "none",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    />
  );
}

function DividerBody({ element }: { element: DividerElement }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: element.thickness,
          backgroundColor: element.color,
        }}
      />
    </div>
  );
}

function ButtonBody({ element }: { element: ButtonElement }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: element.fillColor,
        color: element.textColor,
        borderRadius: element.borderRadius,
        border:
          element.borderWidth > 0
            ? `${element.borderWidth}px solid ${element.borderColor}`
            : "none",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Pretendard, sans-serif",
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        padding: "0 16px",
        textAlign: "center",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        pointerEvents: "none",
      }}
    >
      {element.content}
    </div>
  );
}

function TableBody({ element }: { element: TableElement }) {
  const colWidth = `${100 / element.cols}%`;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: `repeat(${element.cols}, ${colWidth})`,
        gridTemplateRows: `repeat(${element.rows}, 1fr)`,
        pointerEvents: "none",
        fontFamily: "Pretendard, sans-serif",
        fontSize: element.fontSize,
      }}
    >
      {element.cells.flatMap((row, r) =>
        row.map((cell, c) => {
          const isHeader = element.hasHeader && r === 0;
          return (
            <div
              key={`${r}-${c}`}
              style={{
                backgroundColor: isHeader ? element.headerBg : element.bodyBg,
                color: isHeader ? element.headerColor : element.bodyColor,
                fontWeight: isHeader ? 700 : 400,
                border: `1px solid ${element.borderColor}`,
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: isHeader ? "center" : "flex-start",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
}

function ResizeHandles({
  onStart,
}: {
  onStart: (e: React.PointerEvent<HTMLDivElement>, handle: Handle) => void;
}) {
  const handles: { id: Handle; style: React.CSSProperties; cursor: string }[] = [
    { id: "nw", style: { left: -5, top: -5 }, cursor: "nwse-resize" },
    { id: "ne", style: { right: -5, top: -5 }, cursor: "nesw-resize" },
    { id: "sw", style: { left: -5, bottom: -5 }, cursor: "nesw-resize" },
    { id: "se", style: { right: -5, bottom: -5 }, cursor: "nwse-resize" },
    { id: "n", style: { left: "50%", top: -5, transform: "translateX(-50%)" }, cursor: "ns-resize" },
    { id: "s", style: { left: "50%", bottom: -5, transform: "translateX(-50%)" }, cursor: "ns-resize" },
    { id: "w", style: { top: "50%", left: -5, transform: "translateY(-50%)" }, cursor: "ew-resize" },
    { id: "e", style: { top: "50%", right: -5, transform: "translateY(-50%)" }, cursor: "ew-resize" },
  ];
  return (
    <>
      {handles.map((h) => (
        <div
          key={h.id}
          data-export-hide="true"
          onPointerDown={(e) => onStart(e, h.id)}
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            backgroundColor: "#fff",
            border: "1.5px solid #2563eb",
            cursor: h.cursor,
            zIndex: 9999,
            ...h.style,
          }}
        />
      ))}
    </>
  );
}
