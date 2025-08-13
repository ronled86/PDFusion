import { PDFDocument } from "pdf-lib";

export async function placeSignatureImage(
  pdfBytes: Uint8Array,
  pageIndex: number,
  imageBytes: Uint8Array,
  x: number,
  y: number,
  w?: number,
  h?: number
) {
  const doc = await PDFDocument.load(pdfBytes);
  let img;
  try {
    img = await doc.embedPng(imageBytes);
  } catch {
    img = await doc.embedJpg(imageBytes);
  }
  const page = doc.getPage(pageIndex);
  const width = w ?? img.width;
  const height = h ?? img.height;
  page.drawImage(img, { x, y, width, height });
  return await doc.save();
}
