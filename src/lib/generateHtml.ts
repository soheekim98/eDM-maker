import { SliceLine, ClickArea } from "@/types";

interface GenerateHtmlOptions {
  edmTitle: string;
  baseUrl: string;
  imageHeight: number;
  sliceLines: SliceLine[];
  clickAreas: ClickArea[];
  imagePrefix: string; // "", "a", "b"...
}

export function generateHtml({
  edmTitle,
  baseUrl,
  imageHeight,
  sliceLines,
  clickAreas,
  imagePrefix,
}: GenerateHtmlOptions): string {
  const prefix = imagePrefix;
  const sortedYs = [0, ...sliceLines.map((l) => l.y).sort((a, b) => a - b), imageHeight];
  const sliceCount = sortedYs.length - 1;

  // Ensure baseUrl ends with /
  const url = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

  // Group areas by slice
  const areasBySlice = new Map<number, ClickArea[]>();
  clickAreas.forEach((area) => {
    const list = areasBySlice.get(area.sliceIndex) || [];
    list.push(area);
    areasBySlice.set(area.sliceIndex, list);
  });

  // Build image tags
  const imgTags: string[] = [];
  for (let i = 0; i < sliceCount; i++) {
    const fileName = `${prefix}${i + 1}.png`;
    const hasAreas = areasBySlice.has(i);
    const usemap = hasAreas ? ` usemap="#image-map${sliceCount > 1 && areasBySlice.size > 1 ? `-${i + 1}` : ""}"` : "";
    imgTags.push(
      `\t\t <img style="display: block" src="${url}${fileName}" border="0"${usemap}/>`
    );
  }

  // Build map tags
  const mapTags: string[] = [];
  areasBySlice.forEach((areas, sliceIndex) => {
    const mapName = sliceCount > 1 && areasBySlice.size > 1 ? `image-map-${sliceIndex + 1}` : "image-map";
    mapTags.push(`<map name="${mapName}">`);
    areas.forEach((area) => {
      const coords = `${area.x},${area.y},${area.x + area.width},${area.y + area.height}`;
      mapTags.push(
        `\t<area target="_blank" alt="${area.alt}" title="${area.alt}" href="${area.href}" coords="${coords}" shape="rect">`
      );
    });
    mapTags.push(`</map>`);
  });

  const bodyContent = `<title>${edmTitle}</title>
<table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto">
 <tbody>
 <tr>
\t<td style="display: flex;flex-direction: column;align-items: center;width: 100%;">
${imgTags.join("\n")}
\t </td>
\t</tr>
</tbody>
</table>
${mapTags.join("\n")}`;

  const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
\t<meta charset="utf-8" />
\t<meta
\t\tname="viewport"
\t\tcontent="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1, minimum-scale=1"
\t/>
</head>

<body style="padding: 0; margin: 0">
${bodyContent}
</body>
</html>
`;

  return fullHtml;
}

export function extractBodyContent(html: string): string {
  const startTag = "<title>";
  const endTag = "</map>";
  const start = html.indexOf(startTag);
  const end = html.lastIndexOf(endTag);
  if (start === -1) return html;
  if (end === -1) {
    // map 태그가 없는 경우 </table> 까지
    const tableEnd = html.lastIndexOf("</table>");
    if (tableEnd === -1) return html;
    return html.substring(start, tableEnd + "</table>".length);
  }
  return html.substring(start, end + endTag.length);
}
