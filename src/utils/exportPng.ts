import { toJpeg } from "html-to-image";

export async function exportCollageAsPng(element: HTMLElement, backgroundColor = "#ff69b4") {
  const dataUrl = await toJpeg(element, {
    pixelRatio: 3,
    quality: 0.92,
    backgroundColor,
    cacheBust: true,
  });
  const link = document.createElement("a");
  link.download = "collage.jpg";
  link.href = dataUrl;
  link.click();
}
