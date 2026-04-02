"use client";

import { ClickArea } from "@/types";

interface AreaEditDialogProps {
  area: ClickArea;
  onUpdate: (updates: Partial<ClickArea>) => void;
  onDelete: () => void;
}

export default function AreaEditDialog({
  area,
  onUpdate,
  onDelete,
}: AreaEditDialogProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
      <span className="text-gray-500 font-mono text-xs shrink-0">
        ({area.x}, {area.y}, {area.width}x{area.height})
      </span>
      <input
        type="text"
        value={area.alt}
        onChange={(e) => onUpdate({ alt: e.target.value })}
        placeholder="대체 텍스트"
        className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-0 w-36"
      />
      <input
        type="text"
        value={area.href}
        onChange={(e) => onUpdate({ href: e.target.value })}
        placeholder="링크 (href)"
        className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-0 flex-1"
      />
      <button
        onClick={onDelete}
        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 shrink-0"
      >
        삭제
      </button>
    </div>
  );
}
