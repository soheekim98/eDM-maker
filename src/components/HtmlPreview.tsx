"use client";

import { useMemo, useState } from "react";
import { useEdmStore, getImagePrefix, getIndexFilename } from "@/hooks/useEdmStore";
import { generateHtml, extractBodyContent } from "@/lib/generateHtml";
import { copyToClipboard, downloadHtml } from "@/lib/downloadUtils";

export default function HtmlPreview() {
  const { edmTitle, baseUrl, imageHeight, sliceLines, clickAreas, edmOrder } =
    useEdmStore();
  const [copied, setCopied] = useState(false);

  const imagePrefix = getImagePrefix(edmOrder);
  const indexFilename = getIndexFilename(edmOrder);

  const html = useMemo(
    () =>
      generateHtml({
        edmTitle,
        baseUrl,
        imageHeight,
        sliceLines,
        clickAreas,
        imagePrefix,
      }),
    [edmTitle, baseUrl, imageHeight, sliceLines, clickAreas, imagePrefix]
  );

  const bodyContent = useMemo(() => extractBodyContent(html), [html]);

  const handleCopy = async () => {
    await copyToClipboard(bodyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">HTML 코드</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {copied ? "복사 완료!" : "클립보드 복사"}
          </button>
          <button
            onClick={() => downloadHtml(html, indexFilename)}
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            {indexFilename} 다운로드
          </button>
        </div>
      </div>
      <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
        {html}
      </pre>
    </div>
  );
}
