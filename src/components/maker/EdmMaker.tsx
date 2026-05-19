"use client";

import { useRef } from "react";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import Starters from "./Starters";
import CanvasSettings from "./CanvasSettings";
import Properties from "./Properties";
import ExportPanel from "./ExportPanel";
import { useKeyboard } from "./useKeyboard";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-3">
      <h2 className="text-xs font-semibold tracking-wider text-gray-500 mb-2 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function EdmMaker() {
  const canvasRef = useRef<HTMLDivElement>(null);
  useKeyboard();

  return (
    <div className="flex-1 bg-gray-100 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-4 items-start">
          {/* Left: Starters + Canvas settings + Export */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-20">
            <Card title="스타터">
              <Starters />
            </Card>
            <Card title="캔버스">
              <CanvasSettings />
            </Card>
            <Card title="출력">
              <ExportPanel canvasRef={canvasRef} />
            </Card>
          </div>

          {/* Center: Canvas preview */}
          <div className="overflow-auto bg-gray-200 rounded-lg p-6 flex justify-center min-h-[600px]">
            <Canvas ref={canvasRef} />
          </div>

          {/* Right: Toolbar + Properties */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-20">
            <Card title="요소 추가">
              <Toolbar />
            </Card>
            <Card title="속성">
              <Properties />
            </Card>
            <div className="text-xs text-gray-500 leading-relaxed px-1">
              팁: 요소를 클릭해 선택 · 드래그로 이동 · Delete로 삭제 ·
              화살표 키로 미세 이동 (Shift는 10px) · Ctrl+D로 복제
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
