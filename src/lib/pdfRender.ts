import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.js";

// Worker hint for bundlers
pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs")).default as any;

export const loadPdf = async (data: Uint8Array) => {
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  return doc;
};

export const renderPageToCanvas = async (
  pdf: pdfjs.PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  canvas: HTMLCanvasElement
) => {
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext("2d")!;
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const renderCtx = { canvasContext: ctx, viewport };
  await (page.render as any)(renderCtx).promise;
  return { width: viewport.width, height: viewport.height };
};

export const extractTextRects = async (pdf: pdfjs.PDFDocumentProxy, pageIndex: number, query: string) => {
  const page = await pdf.getPage(pageIndex + 1);
  const content = await page.getTextContent();
  const norm = (s: string) => s.toLowerCase();
  const hits: { x: number; y: number; w: number; h: number }[] = [];
  for (const item of content.items as any[]) {
    if (!item.str) continue;
    const s = norm(item.str);
    if (s.includes(norm(query))) {
      const [x, y, x2, y2] = item.transform
        ? [item.transform[4], item.transform[5] - item.height, item.transform[4] + item.width, item.transform[5]]
        : [0, 0, item.width, item.height];
      hits.push({ x, y, w: x2 - x, h: y2 - y });
    }
  }
  return hits;
};
