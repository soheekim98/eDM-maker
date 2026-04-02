import JSZip from "jszip";
import { saveAs } from "file-saver";

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadHtml(html: string, filename: string = "index.html") {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  saveAs(blob, filename);
}

export async function downloadSlicesAsZip(blobs: Blob[], prefix: string = "") {
  const zip = new JSZip();
  blobs.forEach((blob, i) => {
    zip.file(`${prefix}${i + 1}.png`, blob);
  });
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "edm_images.zip");
}

export function downloadSingleSlice(blob: Blob, index: number, prefix: string = "") {
  saveAs(blob, `${prefix}${index + 1}.png`);
}
