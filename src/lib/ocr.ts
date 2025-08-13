import Tesseract from "tesseract.js";

/** Run OCR on a canvas and return words with bounding boxes */
export async function ocrCanvas(canvas: HTMLCanvasElement, lang = "eng") {
  const res = await Tesseract.recognize(canvas, lang, {
    logger: () => {}
  });
  const words: { text: string; x: number; y: number; w: number; h: number }[] = [];
  for (const w of res.data.words || []) {
    words.push({ text: w.text || "", x: w.bbox.x0, y: canvas.height - w.bbox.y1, w: w.bbox.x1 - w.bbox.x0, h: w.bbox.y1 - w.bbox.y0 });
  }
  return words;
}
