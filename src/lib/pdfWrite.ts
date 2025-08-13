import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

export const mergePdfs = async (buffers: Uint8Array[]) => {
  const out = await PDFDocument.create();
  for (const buf of buffers) {
    const src = await PDFDocument.load(buf, { ignoreEncryption: false });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
  }
  return out.save();
};

export const extractPages = async (buffer: Uint8Array, indices: number[]) => {
  const src = await PDFDocument.load(buffer);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach(p => out.addPage(p));
  return out.save();
};

export const insertBlankPage = async (buffer: Uint8Array, at: number, width = 595, height = 842) => {
  const doc = buffer.byteLength ? await PDFDocument.load(buffer) : await PDFDocument.create();
  doc.insertPage(at, [width, height]);
  return doc.save();
};

export const addTextBox = async (buffer: Uint8Array, pageIndex: number, text: string, x: number, y: number, size = 12) => {
  const doc = await PDFDocument.load(buffer);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.getPage(pageIndex);
  page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
  return doc.save();
};

export const addHighlightRects = async (
  buffer: Uint8Array,
  pageIndex: number,
  rects: { x: number; y: number; w: number; h: number }[],
  color = { r: 1, g: 1, b: 0 }
) => {
  const doc = await PDFDocument.load(buffer);
  const page = doc.getPage(pageIndex);
  for (const r of rects) {
    page.drawRectangle({
      x: r.x, y: r.y, width: r.w, height: r.h,
      color: rgb(color.r, color.g, color.b), opacity: 0.35
    });
  }
  return doc.save();
};

export const addInkPath = async (
  buffer: Uint8Array, pageIndex: number, points: { x: number; y: number }[], thickness = 2
) => {
  const doc = await PDFDocument.load(buffer);
  const page = doc.getPage(pageIndex);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    page.drawLine({ start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y }, thickness });
  }
  return doc.save();
};

export const rotatePage = async (buffer: Uint8Array, pageIndex: number, angle = 90) => {
  const doc = await PDFDocument.load(buffer);
  const page = doc.getPage(pageIndex);
  page.setRotation(degrees(((page.getRotation().angle + angle) % 360 + 360) % 360));
  return doc.save();
};
