import { toPng } from "html-to-image";

export async function exportCollageAsPng(element: HTMLElement, backgroundColor = "#f5f0e8") {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor,
  });
  const link = document.createElement("a");
  link.download = "collage.png";
  link.href = dataUrl;
  link.click();
}
