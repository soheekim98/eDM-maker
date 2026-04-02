"use client";

import { useEdmStore } from "@/hooks/useEdmStore";
import ImageUploader from "./ImageUploader";
import SliceEditor from "./SliceEditor";
import AreaMapper from "./AreaMapper";
import SettingsPanel from "./SettingsPanel";
import HtmlPreview from "./HtmlPreview";
import SliceDownloader from "./SliceDownloader";

export default function EdmBuilder() {
  const { sourceImageDataUrl } = useEdmStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-800">eDM 빌더</h1>
          <p className="text-sm text-gray-500">
            설정 → 이미지 업로드 → 슬라이스 → 클릭 영역 매핑 → HTML 생성
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Step 1: Settings */}
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            1. 설정
          </h2>
          <SettingsPanel />
        </section>

        {/* Step 2: Image Upload */}
        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            2. 이미지 업로드
          </h2>
          <ImageUploader />
        </section>

        {sourceImageDataUrl && (
          <>
            {/* Step 3: Slice Editor */}
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                3. 슬라이스 편집
              </h2>
              <SliceEditor />
            </section>

            {/* Step 4: Area Mapping */}
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                4. 클릭 영역 매핑
              </h2>
              <AreaMapper />
            </section>

            {/* Step 5: Slice Download */}
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                5. 이미지 다운로드
              </h2>
              <SliceDownloader />
            </section>

            {/* Step 6: HTML Output */}
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                6. HTML 코드
              </h2>
              <HtmlPreview />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
