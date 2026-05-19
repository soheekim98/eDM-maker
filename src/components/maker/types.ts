export type ElementType =
  | "text"
  | "image"
  | "rectangle"
  | "divider"
  | "table"
  | "button";

export type BackgroundType = "solid" | "image";

export interface CanvasBackground {
  type: BackgroundType;
  color: string;
  imageDataUrl: string | null;
}

interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type TextAlign = "left" | "center" | "right";

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export type ImageFit = "cover" | "contain" | "fill";

export interface ImageElement extends BaseElement {
  type: "image";
  dataUrl: string;
  objectFit: ImageFit;
}

export interface RectangleElement extends BaseElement {
  type: "rectangle";
  fillColor: string;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
}

export interface DividerElement extends BaseElement {
  type: "divider";
  color: string;
  thickness: number;
}

export interface TableElement extends BaseElement {
  type: "table";
  rows: number;
  cols: number;
  cells: string[][];
  hasHeader: boolean;
  headerBg: string;
  headerColor: string;
  bodyBg: string;
  bodyColor: string;
  borderColor: string;
  fontSize: number;
}

export interface ButtonElement extends BaseElement {
  type: "button";
  content: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  fillColor: string;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | RectangleElement
  | DividerElement
  | TableElement
  | ButtonElement;
