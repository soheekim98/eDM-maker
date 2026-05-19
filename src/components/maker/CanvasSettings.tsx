"use client";

import { useMakerStore } from "@/hooks/useMakerStore";

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const MARGIN_PRESETS = [0, 20, 40, 60, 80];

export default function CanvasSettings() {
  const canvasHeight = useMakerStore((s) => s.canvasHeight);
  const setCanvasHeight = useMakerStore((s) => s.setCanvasHeight);
  const background = useMakerStore((s) => s.background);
  const setBackground = useMakerStore((s) => s.setBackground);
  const pageMargin = useMakerStore((s) => s.pageMargin);
  const setPageMargin = useMakerStore((s) => s.setPageMargin);

  const handleBgImage = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await readFile(file);
    setBackground({ imageDataUrl: dataUrl, type: "image" });
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      {/* Canvas height */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">캔버스 높이</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(Number(e.target.value))}
            step={10}
            min={200}
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>

      {/* Page margin */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">페이지 여백</span>
        <div className="flex gap-1 flex-wrap">
          {MARGIN_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPageMargin(m)}
              className={
                "px-2 py-1 rounded text-xs border " +
                (pageMargin === m
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50")
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Background type */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">배경</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setBackground({ type: "solid" })}
            className={
              "flex-1 px-2 py-1.5 rounded text-xs border " +
              (background.type === "solid"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300 text-gray-700")
            }
          >
            단색
          </button>
          <button
            type="button"
            onClick={() => setBackground({ type: "image" })}
            className={
              "flex-1 px-2 py-1.5 rounded text-xs border " +
              (background.type === "image"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300 text-gray-700")
            }
          >
            이미지
          </button>
        </div>
      </div>

      {/* Bg color */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">바탕색</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background.color}
            onChange={(e) => setBackground({ color: e.target.value })}
            className="w-9 h-8 rounded border border-gray-300 shrink-0"
          />
          <input
            type="text"
            value={background.color}
            onChange={(e) => setBackground({ color: e.target.value })}
            className="flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 font-mono text-xs"
          />
        </div>
      </div>

      {background.type === "image" && (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleBgImage(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {background.imageDataUrl && (
            <button
              type="button"
              onClick={() => setBackground({ imageDataUrl: null })}
              className="self-start text-xs text-gray-500 underline"
            >
              배경 이미지 제거
            </button>
          )}
        </div>
      )}
    </div>
  );
}
