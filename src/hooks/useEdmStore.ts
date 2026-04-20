import { create } from "zustand";
import { SliceLine, ClickArea } from "@/types";

interface EdmState {
  // Source image
  sourceImageDataUrl: string | null;
  imageWidth: number;
  imageHeight: number;

  // Slice lines (sorted by y)
  sliceLines: SliceLine[];

  // Click areas
  clickAreas: ClickArea[];

  // Settings
  organization: string;
  date: string;
  baseUrl: string;
  edmTitle: string;
  edmOrder: number; // 1=첫번째, 2=두번째(a), 3=세번째(b)...

  // Actions
  setSourceImage: (dataUrl: string, width: number, height: number) => void;
  resetAll: () => void;
  addSliceLine: (y: number) => void;
  autoSlice800: () => void;
  clearSliceLines: () => void;
  moveSliceLine: (id: string, y: number) => void;
  removeSliceLine: (id: string) => void;
  addClickArea: (area: Omit<ClickArea, "id">) => void;
  updateClickArea: (id: string, updates: Partial<ClickArea>) => void;
  removeClickArea: (id: string) => void;
  setOrganization: (org: string) => void;
  setDate: (date: string) => void;
  setBaseUrl: (url: string) => void;
  setEdmTitle: (title: string) => void;
  setEdmOrder: (order: number) => void;
}

const ORGS: Record<string, string> = {
  디스플레이메일서버: "https://web.kdia.org/",
  디스플레이산업협회: "https://www.kdia.org/",
  반도체산업협회: "https://www.ksia.or.kr/",
};

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function buildBaseUrl(org: string, date: string) {
  const orgUrl = ORGS[org] || "";
  if (!orgUrl) return "";
  return `${orgUrl}edm/${date}/images/`;
}

let areaIdCounter = 0;

export const useEdmStore = create<EdmState>((set) => ({
  sourceImageDataUrl: null,
  imageWidth: 0,
  imageHeight: 0,
  sliceLines: [],
  clickAreas: [],
  organization: "반도체산업협회",
  date: getTodayStr(),
  baseUrl: buildBaseUrl("반도체산업협회", getTodayStr()),
  edmTitle: "",
  edmOrder: 1,

  setSourceImage: (dataUrl, width, height) =>
    set({
      sourceImageDataUrl: dataUrl,
      imageWidth: width,
      imageHeight: height,
      sliceLines: [],
      clickAreas: [],
    }),

  resetAll: () =>
    set({
      sourceImageDataUrl: null,
      imageWidth: 0,
      imageHeight: 0,
      sliceLines: [],
      clickAreas: [],
      baseUrl: "",
      edmTitle: "",
    }),

  addSliceLine: (y) =>
    set((state) => ({
      sliceLines: [...state.sliceLines, { id: crypto.randomUUID(), y }].sort(
        (a, b) => a.y - b.y
      ),
    })),

  autoSlice800: () =>
    set((state) => {
      if (state.imageHeight <= 800) return state;
      const lines: SliceLine[] = [];
      for (let y = 800; y < state.imageHeight; y += 800) {
        lines.push({ id: crypto.randomUUID(), y });
      }
      return { sliceLines: lines, clickAreas: [] };
    }),

  clearSliceLines: () => set({ sliceLines: [], clickAreas: [] }),

  moveSliceLine: (id, y) =>
    set((state) => ({
      sliceLines: state.sliceLines
        .map((line) => (line.id === id ? { ...line, y } : line))
        .sort((a, b) => a.y - b.y),
    })),

  removeSliceLine: (id) =>
    set((state) => {
      const removedLine = state.sliceLines.find((l) => l.id === id);
      if (!removedLine) return state;

      const newLines = state.sliceLines.filter((l) => l.id !== id);

      // Recalculate slice indices for click areas
      const oldYs = [0, ...state.sliceLines.map((l) => l.y), state.imageHeight];
      const newYs = [0, ...newLines.map((l) => l.y), state.imageHeight];

      const updatedAreas = state.clickAreas
        .map((area) => {
          // Find the old slice's absolute y range
          const oldStart = oldYs[area.sliceIndex];
          const absY = oldStart + area.y;
          const absBottom = absY + area.height;

          // Find which new slice this area belongs to
          for (let i = 0; i < newYs.length - 1; i++) {
            if (absY >= newYs[i] && absY < newYs[i + 1]) {
              return {
                ...area,
                sliceIndex: i,
                y: absY - newYs[i],
              };
            }
          }
          return null;
        })
        .filter((a): a is ClickArea => a !== null);

      return { sliceLines: newLines, clickAreas: updatedAreas };
    }),

  addClickArea: (area) =>
    set((state) => ({
      clickAreas: [
        ...state.clickAreas,
        { ...area, id: `area-${++areaIdCounter}` },
      ],
    })),

  updateClickArea: (id, updates) =>
    set((state) => ({
      clickAreas: state.clickAreas.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeClickArea: (id) =>
    set((state) => ({
      clickAreas: state.clickAreas.filter((a) => a.id !== id),
    })),

  setOrganization: (org) =>
    set((state) => ({
      organization: org,
      baseUrl: buildBaseUrl(org, state.date),
    })),

  setDate: (date) =>
    set((state) => ({
      date,
      baseUrl: buildBaseUrl(state.organization, date),
    })),

  setBaseUrl: (url) => set({ baseUrl: url }),
  setEdmTitle: (title) => set({ edmTitle: title }),
  setEdmOrder: (order) => set({ edmOrder: order }),
}));

// 1번째: "1.png" / 2번째: "a1.png" / 3번째: "b1.png"
export function getImagePrefix(order: number): string {
  if (order <= 1) return "";
  return String.fromCharCode(96 + order - 1); // 2->a, 3->b, 4->c...
}

// 1번째: "index.html" / 2번째: "index2.html" / 3번째: "index3.html"
export function getIndexFilename(order: number): string {
  if (order <= 1) return "index.html";
  return `index${order}.html`;
}

// "https://www.ksia.or.kr/edm/20260402/images/" → "https://www.ksia.or.kr/edm/20260402/index.html"
export function getEdmPageUrl(baseUrl: string, indexFilename: string): string {
  return baseUrl.replace(/images\/$/, indexFilename);
}

export { ORGS };
