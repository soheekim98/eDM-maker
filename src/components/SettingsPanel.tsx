"use client";

import { useEdmStore, ORGS, getImagePrefix, getIndexFilename } from "@/hooks/useEdmStore";

const ORDER_OPTIONS = [
  { value: 1, label: "1번째 작업" },
  { value: 2, label: "2번째 작업" },
  { value: 3, label: "3번째 작업" },
  { value: 4, label: "4번째 작업" },
];

export default function SettingsPanel() {
  const {
    organization,
    date,
    baseUrl,
    edmTitle,
    edmOrder,
    setOrganization,
    setDate,
    setBaseUrl,
    setEdmTitle,
    setEdmOrder,
  } = useEdmStore();

  const prefix = getImagePrefix(edmOrder);
  const indexName = getIndexFilename(edmOrder);

  return (
    <div className="space-y-3">
      {/* 작업 순서 버튼 */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">작업 순서 (같은 날 여러 건)</label>
        <div className="flex gap-2">
          {ORDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEdmOrder(opt.value)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                edmOrder === opt.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {edmOrder > 1 && (
          <p className="mt-1 text-xs text-gray-500">
            이미지: <span className="font-mono text-blue-600">{prefix}1.png, {prefix}2.png, ...</span>
            {" / "}
            HTML: <span className="font-mono text-blue-600">{indexName}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">업체 선택</label>
          <select
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {Object.keys(ORGS).map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">날짜</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="20260402"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">eDM 제목</label>
          <input
            type="text"
            value={edmTitle}
            onChange={(e) => setEdmTitle(e.target.value)}
            placeholder="예: 2026년도 반도체 유공자 포상"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          이미지 베이스 URL{" "}
          <span className="text-gray-400">(자동 생성, 직접 수정 가능)</span>
        </label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://www.example.com/edm/20260402/images/"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-xs"
        />
      </div>
    </div>
  );
}
