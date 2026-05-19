import { create } from "zustand";
import type {
  ButtonElement,
  CanvasBackground,
  CanvasElement,
  DividerElement,
  ImageElement,
  RectangleElement,
  TableElement,
  TextElement,
} from "@/components/maker/types";

type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;
type StarterInput = DistributiveOmit<CanvasElement, "id" | "zIndex">;

interface MakerState {
  canvasWidth: number;
  canvasHeight: number;
  pageMargin: number;
  background: CanvasBackground;
  elements: CanvasElement[];
  selectedId: string | null;

  setCanvasHeight: (h: number) => void;
  setPageMargin: (m: number) => void;
  setBackground: (patch: Partial<CanvasBackground>) => void;

  addText: () => void;
  addImage: (dataUrl: string, naturalWidth: number, naturalHeight: number) => void;
  addRectangle: () => void;
  addDivider: () => void;
  addTable: () => void;
  addButton: () => void;

  applyStarter: (elements: StarterInput[]) => void;

  selectElement: (id: string | null) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  moveElement: (id: string, dx: number, dy: number) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  resetAll: () => void;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

const DEFAULT_BACKGROUND: CanvasBackground = {
  type: "solid",
  color: "#ffffff",
  imageDataUrl: null,
};

function nextZ(elements: CanvasElement[]): number {
  return elements.length === 0 ? 1 : Math.max(...elements.map((e) => e.zIndex)) + 1;
}

function emptyCells(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

function clampToMargin<T extends { x: number; y: number; width: number; height: number }>(
  el: T,
  canvasW: number,
  canvasH: number,
  margin: number
): T {
  const availW = Math.max(10, canvasW - 2 * margin);
  const availH = Math.max(10, canvasH - 2 * margin);
  const width = Math.max(10, Math.min(el.width, availW));
  const height = Math.max(10, Math.min(el.height, availH));
  const x = Math.max(margin, Math.min(canvasW - margin - width, el.x));
  const y = Math.max(margin, Math.min(canvasH - margin - height, el.y));
  return { ...el, x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

export const useMakerStore = create<MakerState>((set, get) => ({
  canvasWidth: 800,
  canvasHeight: 1200,
  pageMargin: 40,
  background: DEFAULT_BACKGROUND,
  elements: [],
  selectedId: null,

  setCanvasHeight: (h) =>
    set((state) => {
      const newH = Math.max(200, Math.round(h));
      return {
        canvasHeight: newH,
        elements: state.elements.map(
          (el) =>
            clampToMargin(
              el,
              state.canvasWidth,
              newH,
              state.pageMargin
            ) as CanvasElement
        ),
      };
    }),
  setPageMargin: (m) =>
    set((state) => {
      const newM = Math.max(0, Math.round(m));
      return {
        pageMargin: newM,
        elements: state.elements.map(
          (el) =>
            clampToMargin(
              el,
              state.canvasWidth,
              state.canvasHeight,
              newM
            ) as CanvasElement
        ),
      };
    }),

  setBackground: (patch) =>
    set((state) => ({ background: { ...state.background, ...patch } })),

  addText: () => {
    const s = get();
    const m = s.pageMargin;
    const w = Math.min(400, s.canvasWidth - 2 * m);
    const el: TextElement = {
      id: uid(),
      type: "text",
      x: Math.round((s.canvasWidth - w) / 2),
      y: Math.max(m, Math.round(s.canvasHeight / 2 - 30)),
      width: w,
      height: 60,
      zIndex: nextZ(s.elements),
      content: "텍스트를 입력하세요",
      fontSize: 28,
      fontWeight: 700,
      color: "#0f172a",
      textAlign: "left",
      lineHeight: 1.4,
      letterSpacing: 0,
    };
    set({ elements: [...s.elements, el], selectedId: el.id });
  },

  addImage: (dataUrl, naturalWidth, naturalHeight) => {
    const s = get();
    const m = s.pageMargin;
    const maxW = Math.min(s.canvasWidth - 2 * m, 600);
    const ratio = naturalHeight / Math.max(1, naturalWidth);
    const w = Math.min(maxW, naturalWidth);
    const h = Math.round(w * ratio);
    const el: ImageElement = {
      id: uid(),
      type: "image",
      x: Math.round((s.canvasWidth - w) / 2),
      y: Math.max(m, Math.round(s.canvasHeight / 2 - h / 2)),
      width: w,
      height: h,
      zIndex: nextZ(s.elements),
      dataUrl,
      objectFit: "contain",
    };
    set({ elements: [...s.elements, el], selectedId: el.id });
  },

  addRectangle: () => {
    const s = get();
    const m = s.pageMargin;
    const w = Math.min(400, s.canvasWidth - 2 * m);
    const h = 120;
    const el: RectangleElement = {
      id: uid(),
      type: "rectangle",
      x: Math.round((s.canvasWidth - w) / 2),
      y: Math.max(m, Math.round(s.canvasHeight / 2 - h / 2)),
      width: w,
      height: h,
      zIndex: nextZ(s.elements),
      fillColor: "#f1f5f9",
      borderRadius: 8,
      borderColor: "#cbd5e1",
      borderWidth: 0,
    };
    set({ elements: [...s.elements, el], selectedId: el.id });
  },

  addDivider: () => {
    const s = get();
    const m = s.pageMargin;
    const w = Math.min(600, s.canvasWidth - 2 * m);
    const el: DividerElement = {
      id: uid(),
      type: "divider",
      x: Math.round((s.canvasWidth - w) / 2),
      y: Math.max(m, Math.round(s.canvasHeight / 2)),
      width: w,
      height: 2,
      zIndex: nextZ(s.elements),
      color: "#cbd5e1",
      thickness: 2,
    };
    set({ elements: [...s.elements, el], selectedId: el.id });
  },

  addButton: () => {
    const s = get();
    const m = s.pageMargin;
    const w = Math.min(200, s.canvasWidth - 2 * m);
    const h = 56;
    const el: ButtonElement = {
      id: uid(),
      type: "button",
      x: Math.round((s.canvasWidth - w) / 2),
      y: Math.max(m, Math.round(s.canvasHeight / 2 - h / 2)),
      width: w,
      height: h,
      zIndex: nextZ(s.elements),
      content: "버튼",
      fontSize: 16,
      fontWeight: 700,
      textColor: "#ffffff",
      fillColor: "#1e40af",
      borderRadius: 28,
      borderColor: "#1e40af",
      borderWidth: 0,
    };
    set({ elements: [...s.elements, el], selectedId: el.id });
  },

  addTable: () => {
    const s = get();
    const m = s.pageMargin;
    const w = Math.min(600, s.canvasWidth - 2 * m);
    const rows = 4;
    const cols = 3;
    const el: TableElement = {
      id: uid(),
      type: "table",
      x: Math.round((s.canvasWidth - w) / 2),
      y: Math.max(m, Math.round(s.canvasHeight / 2 - 80)),
      width: w,
      height: 160,
      zIndex: nextZ(s.elements),
      rows,
      cols,
      cells: emptyCells(rows, cols),
      hasHeader: true,
      headerBg: "#1e40af",
      headerColor: "#ffffff",
      bodyBg: "#ffffff",
      bodyColor: "#0f172a",
      borderColor: "#cbd5e1",
      fontSize: 14,
    };
    set({ elements: [...s.elements, el], selectedId: el.id });
  },

  applyStarter: (template) => {
    const state = get();
    const baseZ = nextZ(state.elements);
    const newEls: CanvasElement[] = template.map((t, i) => {
      const withMeta = { ...t, id: uid(), zIndex: baseZ + i } as CanvasElement;
      return clampToMargin(
        withMeta,
        state.canvasWidth,
        state.canvasHeight,
        state.pageMargin
      ) as CanvasElement;
    });
    set({
      elements: [...state.elements, ...newEls],
      selectedId: newEls[0]?.id ?? null,
    });
  },

  selectElement: (id) => set({ selectedId: id }),

  updateElement: (id, patch) =>
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id !== id) return el;
        const merged = { ...el, ...patch } as CanvasElement;
        return clampToMargin(
          merged,
          state.canvasWidth,
          state.canvasHeight,
          state.pageMargin
        ) as CanvasElement;
      }),
    })),

  moveElement: (id, dx, dy) =>
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id !== id) return el;
        const moved = { ...el, x: el.x + dx, y: el.y + dy };
        return clampToMargin(
          moved,
          state.canvasWidth,
          state.canvasHeight,
          state.pageMargin
        ) as CanvasElement;
      }),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  duplicateElement: (id) =>
    set((state) => {
      const src = state.elements.find((e) => e.id === id);
      if (!src) return state;
      const copyRaw = {
        ...src,
        id: uid(),
        x: src.x + 20,
        y: src.y + 20,
        zIndex: nextZ(state.elements),
      } as CanvasElement;
      const copy = clampToMargin(
        copyRaw,
        state.canvasWidth,
        state.canvasHeight,
        state.pageMargin
      ) as CanvasElement;
      return { elements: [...state.elements, copy], selectedId: copy.id };
    }),

  bringForward: (id) =>
    set((state) => {
      const maxZ = Math.max(...state.elements.map((e) => e.zIndex), 0);
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: maxZ + 1 } : el
        ),
      };
    }),

  sendBackward: (id) =>
    set((state) => {
      const minZ = Math.min(...state.elements.map((e) => e.zIndex), 1);
      return {
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, zIndex: minZ - 1 } : el
        ),
      };
    }),

  resetAll: () =>
    set({
      canvasWidth: 800,
      canvasHeight: 1200,
      pageMargin: 40,
      background: DEFAULT_BACKGROUND,
      elements: [],
      selectedId: null,
    }),
}));
