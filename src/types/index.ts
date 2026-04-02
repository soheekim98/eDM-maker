export interface SliceLine {
  id: string;
  y: number; // pixel position from top of original image
}

export interface ClickArea {
  id: string;
  sliceIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  href: string;
  alt: string;
}
