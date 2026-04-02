export async function sliceImage(
  imageSrc: string,
  imageWidth: number,
  imageHeight: number,
  sliceYPositions: number[]
): Promise<Blob[]> {
  const img = await loadImage(imageSrc);
  const sortedYs = [0, ...sliceYPositions.sort((a, b) => a - b), imageHeight];
  const blobs: Blob[] = [];

  for (let i = 0; i < sortedYs.length - 1; i++) {
    const startY = sortedYs[i];
    const height = sortedYs[i + 1] - startY;

    const canvas = document.createElement("canvas");
    canvas.width = imageWidth;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, startY, imageWidth, height, 0, 0, imageWidth, height);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/png");
    });
    blobs.push(blob);
  }

  return blobs;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
