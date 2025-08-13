import { PDFDocument } from "pdf-lib";
import { renderPageToCanvas } from "./pdfRender";

/** Redact by rasterization: draw filled rects on a rendered page, replace page with a flat image. */
export async function redactByRasterize(
  pdfBytes: Uint8Array,
  pdf: any,
  pageIndex: number,
  zoomForExport = 2,
  rects: { x: number; y: number; w: number; h: number }[]
) {
  const canvas = document.createElement("canvas");
  await renderPageToCanvas(pdf, pageIndex, zoomForExport, canvas as HTMLCanvasElement);
  const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "black";
  for (const r of rects) {
    ctx.fillRect(r.x * zoomForExport, (canvas.height - (r.y + r.h) * zoomForExport), r.w * zoomForExport, r.h * zoomForExport);
  }
  ctx.restore();
  const dataUrl = (canvas as HTMLCanvasElement).toDataURL("image/png");
  const pngBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), c => c.charCodeAt(0));

  const src = await PDFDocument.load(pdfBytes);
  const [width, height] = src.getPage(pageIndex).getSize();
  const pngDoc = await PDFDocument.create();
  const pageImg = await pngDoc.embedPng(pngBytes);
  const p = pngDoc.addPage([width, height]);
  p.drawImage(pageImg, { x: 0, y: 0, width, height });

  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  const newPages = await out.copyPages(pngDoc, [0]);
  pages[pageIndex] = newPages[0];
  pages.forEach(pg => out.addPage(pg));
  return await out.save();
}
