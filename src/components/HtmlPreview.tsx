"use client";

import { useMemo, useState } from "react";
import { useEdmStore, getImagePrefix, getIndexFilename, getEdmPageUrl } from "@/hooks/useEdmStore";
import { generateHtml, extractBodyContent } from "@/lib/generateHtml";
import { copyToClipboard } from "@/lib/downloadUtils";

export default function HtmlPreview() {
  const { edmTitle, baseUrl, imageHeight, sliceLines, clickAreas, edmOrder } =
    useEdmStore();
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const imagePrefix = getImagePrefix(edmOrder);
  const indexFilename = getIndexFilename(edmOrder);
  const edmPageUrl = getEdmPageUrl(baseUrl, indexFilename);

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

  const handleCopyBody = async () => {
    await copyToClipboard(bodyContent);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleCopyLinkAndSource = async () => {
    const text = `링크: ${edmPageUrl}\n소스:\n ${bodyContent}`;
    await copyToClipboard(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveToFolder = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dirHandle = await (window as any).showDirectoryPicker();
      const fileHandle = await dirHandle.getFileHandle(indexFilename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(new Blob([html], { type: "text/html;charset=utf-8" }));
      await writable.close();
      alert(`${indexFilename} 저장 완료`);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      throw e;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">HTML 코드</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSaveToFolder}
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            폴더에 저장
          </button>
        </div>
      </div>

      {edmPageUrl && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
          <span className="text-sm text-gray-500 shrink-0">서버 경로:</span>
          <span className="text-sm text-gray-800 truncate flex-1">{edmPageUrl}</span>
          <button
            onClick={handleCopyLinkAndSource}
            className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 shrink-0"
          >
            {copiedLink ? "복사 완료!" : "링크+소스 복사"}
          </button>
          <button
            onClick={handleCopyBody}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 shrink-0"
          >
            {copiedBody ? "복사 완료!" : "소스만 복사"}
          </button>
        </div>
      )}

      <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
        {html}
      </pre>
    </div>
  );
}
