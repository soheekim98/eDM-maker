"use client";

import { useMakerStore } from "@/hooks/useMakerStore";
import { STARTERS } from "./starterData";

export default function Starters() {
  const applyStarter = useMakerStore((s) => s.applyStarter);

  return (
    <div className="flex flex-col gap-2">
      {STARTERS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => {
            if (
              confirm(
                `"${s.name}" 스타터를 현재 캔버스에 추가합니다. 계속할까요?`
              )
            ) {
              applyStarter(s.elements);
            }
          }}
          className="text-left rounded-md border border-gray-200 p-2 hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="text-sm font-semibold text-gray-800">{s.name}</div>
          <div className="text-xs text-gray-500 mt-0.5 leading-snug">
            {s.description}
          </div>
        </button>
      ))}
    </div>
  );
}
