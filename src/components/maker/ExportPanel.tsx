"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import { useEdmStore } from "@/hooks/useEdmStore";
import { useMakerStore } from "@/hooks/useMakerStore";

interface Props {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

async function renderToPng(node: HTMLElement): Promise<string> {
  return await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    filter: (el) =>
      !(el instanceof HTMLElement && el.dataset.exportHide === "true"),
  });
}

function dataUrlSize(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function ExportPanel({ canvasRef }: Props) {
  const router = useRouter();
  const setSourceImage = useEdmStore((s) => s.setSourceImage);
  const selectElement = useMakerStore((s) => s.selectElement);
  const [busy, setBusy] = useState<null | "png" | "builder">(null);
  const [err, setErr] = useState<string | null>(null);

  const capture = async (): Promise<string | null> => {
    if (!canvasRef.current) return null;
    selectElement(null);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    return await renderToPng(canvasRef.current);
  };

  const handleDownload = async () => {
    setBusy("png");
    setErr(null);
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      saveAs(blob, `edm-${Date.now()}.png`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "PNG 생성 실패");
    } finally {
      setBusy(null);
    }
  };

  const handleSendToBuilder = async () => {
    setBusy("builder");
    setErr(null);
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const { width, height } = await dataUrlSize(dataUrl);
      setSourceImage(dataUrl, width, height);
      router.push("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "빌더 전달 실패");
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy !== null}
        className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
      >
        {busy === "png" ? "생성 중…" : "PNG 다운로드"}
      </button>
      <button
        type="button"
        onClick={handleSendToBuilder}
        disabled={busy !== null}
        className="px-3 py-2 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
      >
        {busy === "builder" ? "전달 중…" : "빌더로 보내기 →"}
      </button>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
