"use client";

import { useMakerStore } from "@/hooks/useMakerStore";
import type {
  ButtonElement,
  CanvasElement,
  ImageElement,
  RectangleElement,
  DividerElement,
  TableElement,
  TextElement,
} from "./types";

export default function Properties() {
  const selectedId = useMakerStore((s) => s.selectedId);
  const elements = useMakerStore((s) => s.elements);

  const selected = selectedId
    ? elements.find((e) => e.id === selectedId) ?? null
    : null;

  if (!selected) {
    return (
      <p className="text-sm text-gray-500">
        캔버스에서 요소를 선택하면 여기에 속성이 표시됩니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <CommonProps element={selected} />
      <hr className="border-gray-100" />
      {selected.type === "text" && <TextProps element={selected} />}
      {selected.type === "image" && <ImageProps element={selected} />}
      {selected.type === "rectangle" && <RectangleProps element={selected} />}
      {selected.type === "divider" && <DividerProps element={selected} />}
      {selected.type === "table" && <TableProps element={selected} />}
      {selected.type === "button" && <ButtonProps element={selected} />}
      <hr className="border-gray-100" />
      <ActionButtons element={selected} />
    </div>
  );
}

// Compact field wrappers
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function NumInput({
  value,
  onChange,
  step = 1,
  min,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      min={min}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full min-w-0 rounded border border-gray-300 px-2 py-1 text-sm"
    />
  );
}

function ColorRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-8 rounded border border-gray-300 shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 font-mono text-xs"
      />
    </div>
  );
}

function CommonProps({ element }: { element: CanvasElement }) {
  const update = useMakerStore((s) => s.updateElement);
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label="X">
        <NumInput
          value={element.x}
          onChange={(n) => update(element.id, { x: Math.round(n) })}
        />
      </Field>
      <Field label="Y">
        <NumInput
          value={element.y}
          onChange={(n) => update(element.id, { y: Math.round(n) })}
        />
      </Field>
      <Field label="너비">
        <NumInput
          value={element.width}
          min={10}
          onChange={(n) => update(element.id, { width: Math.max(10, Math.round(n)) })}
        />
      </Field>
      <Field label="높이">
        <NumInput
          value={element.height}
          min={10}
          onChange={(n) => update(element.id, { height: Math.max(10, Math.round(n)) })}
        />
      </Field>
    </div>
  );
}

function TextProps({ element }: { element: TextElement }) {
  const update = useMakerStore((s) => s.updateElement);
  const set = (patch: Partial<TextElement>) => update(element.id, patch);

  return (
    <div className="flex flex-col gap-3">
      <Field label="내용">
        <textarea
          value={element.content}
          onChange={(e) => set({ content: e.target.value })}
          rows={3}
          className="w-full min-w-0 rounded border border-gray-300 px-2 py-1.5 text-sm resize-y"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="폰트">
          <NumInput
            value={element.fontSize}
            min={6}
            onChange={(n) => set({ fontSize: Math.max(6, Math.round(n)) })}
          />
        </Field>
        <Field label="굵기">
          <select
            value={element.fontWeight}
            onChange={(e) => set({ fontWeight: Number(e.target.value) })}
            className="w-full min-w-0 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {[300, 400, 500, 600, 700, 800, 900].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="색">
        <ColorRow value={element.color} onChange={(v) => set({ color: v })} />
      </Field>

      <Field label="정렬">
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => set({ textAlign: a })}
              className={
                "flex-1 px-2 py-1 rounded text-xs border " +
                (element.textAlign === a
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300 text-gray-700")
              }
            >
              {a === "left" ? "왼쪽" : a === "center" ? "가운데" : "오른쪽"}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="행간">
          <NumInput
            value={element.lineHeight}
            step={0.05}
            min={0.5}
            onChange={(n) => set({ lineHeight: n })}
          />
        </Field>
        <Field label="자간">
          <NumInput
            value={element.letterSpacing}
            step={0.1}
            onChange={(n) => set({ letterSpacing: n })}
          />
        </Field>
      </div>
    </div>
  );
}

function ImageProps({ element }: { element: ImageElement }) {
  const update = useMakerStore((s) => s.updateElement);
  const set = (patch: Partial<ImageElement>) => update(element.id, patch);

  const replace = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label="맞춤">
        <div className="flex gap-1">
          {(["contain", "cover", "fill"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => set({ objectFit: f })}
              className={
                "flex-1 px-2 py-1 rounded text-xs border " +
                (element.objectFit === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300 text-gray-700")
              }
            >
              {f === "contain" ? "비율유지" : f === "cover" ? "꽉채움" : "늘이기"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="이미지 교체">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            replace(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
          className="text-xs"
        />
      </Field>
    </div>
  );
}

function RectangleProps({ element }: { element: RectangleElement }) {
  const update = useMakerStore((s) => s.updateElement);
  const set = (patch: Partial<RectangleElement>) => update(element.id, patch);

  return (
    <div className="flex flex-col gap-3">
      <Field label="채움색">
        <ColorRow
          value={element.fillColor}
          onChange={(v) => set({ fillColor: v })}
        />
      </Field>
      <Field label="모서리 반경">
        <NumInput
          value={element.borderRadius}
          min={0}
          onChange={(n) => set({ borderRadius: Math.max(0, n) })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="테두리 두께">
          <NumInput
            value={element.borderWidth}
            min={0}
            onChange={(n) => set({ borderWidth: Math.max(0, n) })}
          />
        </Field>
        <Field label="테두리 색">
          <input
            type="color"
            value={element.borderColor}
            onChange={(e) => set({ borderColor: e.target.value })}
            className="w-full h-8 rounded border border-gray-300"
          />
        </Field>
      </div>
    </div>
  );
}

function DividerProps({ element }: { element: DividerElement }) {
  const update = useMakerStore((s) => s.updateElement);
  const set = (patch: Partial<DividerElement>) => update(element.id, patch);

  return (
    <div className="flex flex-col gap-3">
      <Field label="색">
        <ColorRow value={element.color} onChange={(v) => set({ color: v })} />
      </Field>
      <Field label="두께">
        <NumInput
          value={element.thickness}
          min={1}
          onChange={(n) => set({ thickness: Math.max(1, n) })}
        />
      </Field>
    </div>
  );
}

function ButtonProps({ element }: { element: ButtonElement }) {
  const update = useMakerStore((s) => s.updateElement);
  const set = (patch: Partial<ButtonElement>) => update(element.id, patch);

  return (
    <div className="flex flex-col gap-3">
      <Field label="텍스트">
        <input
          type="text"
          value={element.content}
          onChange={(e) => set({ content: e.target.value })}
          className="w-full min-w-0 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="폰트">
          <NumInput
            value={element.fontSize}
            min={6}
            onChange={(n) => set({ fontSize: Math.max(6, Math.round(n)) })}
          />
        </Field>
        <Field label="굵기">
          <select
            value={element.fontWeight}
            onChange={(e) => set({ fontWeight: Number(e.target.value) })}
            className="w-full min-w-0 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {[300, 400, 500, 600, 700, 800, 900].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="글자색">
        <ColorRow
          value={element.textColor}
          onChange={(v) => set({ textColor: v })}
        />
      </Field>

      <Field label="배경색">
        <ColorRow
          value={element.fillColor}
          onChange={(v) => set({ fillColor: v })}
        />
      </Field>

      <Field label="모서리 반경">
        <NumInput
          value={element.borderRadius}
          min={0}
          onChange={(n) => set({ borderRadius: Math.max(0, n) })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="테두리 두께">
          <NumInput
            value={element.borderWidth}
            min={0}
            onChange={(n) => set({ borderWidth: Math.max(0, n) })}
          />
        </Field>
        <Field label="테두리 색">
          <input
            type="color"
            value={element.borderColor}
            onChange={(e) => set({ borderColor: e.target.value })}
            className="w-full h-8 rounded border border-gray-300"
          />
        </Field>
      </div>
    </div>
  );
}

function TableProps({ element }: { element: TableElement }) {
  const update = useMakerStore((s) => s.updateElement);
  const set = (patch: Partial<TableElement>) => update(element.id, patch);

  const setRows = (rows: number) => {
    const safeRows = Math.max(1, Math.round(rows));
    const next = element.cells.slice(0, safeRows);
    while (next.length < safeRows) {
      next.push(new Array(element.cols).fill(""));
    }
    set({ rows: safeRows, cells: next });
  };

  const setCols = (cols: number) => {
    const safeCols = Math.max(1, Math.round(cols));
    const next = element.cells.map((row) => {
      const r = row.slice(0, safeCols);
      while (r.length < safeCols) r.push("");
      return r;
    });
    set({ cols: safeCols, cells: next });
  };

  const setCell = (r: number, c: number, value: string) => {
    const next = element.cells.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row
    );
    set({ cells: next });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="행 수">
          <NumInput
            value={element.rows}
            min={1}
            onChange={setRows}
          />
        </Field>
        <Field label="열 수">
          <NumInput
            value={element.cols}
            min={1}
            onChange={setCols}
          />
        </Field>
      </div>
      <Field label="헤더 행">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => set({ hasHeader: !element.hasHeader })}
            className={
              "flex-1 px-2 py-1 rounded text-xs border " +
              (element.hasHeader
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300 text-gray-700")
            }
          >
            {element.hasHeader ? "사용 중" : "사용 안 함"}
          </button>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="헤더 배경">
          <ColorRow
            value={element.headerBg}
            onChange={(v) => set({ headerBg: v })}
          />
        </Field>
        <Field label="헤더 글자">
          <ColorRow
            value={element.headerColor}
            onChange={(v) => set({ headerColor: v })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="본문 배경">
          <ColorRow
            value={element.bodyBg}
            onChange={(v) => set({ bodyBg: v })}
          />
        </Field>
        <Field label="테두리 색">
          <ColorRow
            value={element.borderColor}
            onChange={(v) => set({ borderColor: v })}
          />
        </Field>
      </div>
      <Field label="폰트 크기">
        <NumInput
          value={element.fontSize}
          min={8}
          onChange={(n) => set({ fontSize: Math.max(8, n) })}
        />
      </Field>

      {/* Cell editor */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">셀 내용</span>
        <div className="flex flex-col gap-1 max-h-64 overflow-auto border border-gray-200 rounded p-2">
          {element.cells.map((row, r) => (
            <div key={r} className="flex gap-1">
              <span className="text-xs text-gray-400 w-5 shrink-0 pt-1.5">
                {r + 1}
              </span>
              {row.map((cell, c) => (
                <input
                  key={c}
                  type="text"
                  value={cell}
                  onChange={(e) => setCell(r, c, e.target.value)}
                  placeholder={
                    element.hasHeader && r === 0 ? "헤더" : `${r + 1},${c + 1}`
                  }
                  className="flex-1 min-w-0 rounded border border-gray-200 px-1.5 py-1 text-xs"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ element }: { element: CanvasElement }) {
  const duplicate = useMakerStore((s) => s.duplicateElement);
  const remove = useMakerStore((s) => s.removeElement);
  const bringForward = useMakerStore((s) => s.bringForward);
  const sendBackward = useMakerStore((s) => s.sendBackward);

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => bringForward(element.id)}
        className="px-2 py-1.5 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
      >
        앞으로
      </button>
      <button
        type="button"
        onClick={() => sendBackward(element.id)}
        className="px-2 py-1.5 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
      >
        뒤로
      </button>
      <button
        type="button"
        onClick={() => duplicate(element.id)}
        className="px-2 py-1.5 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
      >
        복제
      </button>
      <button
        type="button"
        onClick={() => remove(element.id)}
        className="px-2 py-1.5 rounded border border-red-300 text-xs text-red-600 hover:bg-red-50"
      >
        삭제
      </button>
    </div>
  );
}
