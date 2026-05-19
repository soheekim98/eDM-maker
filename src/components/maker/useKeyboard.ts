"use client";

import { useEffect } from "react";
import { useMakerStore } from "@/hooks/useMakerStore";

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    t.isContentEditable
  );
}

export function useKeyboard() {
  const selectedId = useMakerStore((s) => s.selectedId);
  const removeElement = useMakerStore((s) => s.removeElement);
  const moveElement = useMakerStore((s) => s.moveElement);
  const duplicateElement = useMakerStore((s) => s.duplicateElement);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId) return;
      if (isEditableTarget(e.target)) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeElement(selectedId);
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveElement(selectedId, -step, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveElement(selectedId, step, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveElement(selectedId, 0, -step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveElement(selectedId, 0, step);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateElement(selectedId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, removeElement, moveElement, duplicateElement]);
}
