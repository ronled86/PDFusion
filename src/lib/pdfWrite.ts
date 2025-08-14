import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

// Helper function to validate PDF buffer
const validatePdfBuffer = (buffer: Uint8Array): boolean => {
  if (!buffer || buffer.length === 0) {
    console.error("Empty or null PDF buffer");
    return false;
  }
  
  // Check for PDF header
  const headerString = Array.from(buffer.slice(0, 8))
    .map(byte => String.fromCharCode(byte))
    .join('');
  
  if (!headerString.startsWith('%PDF-')) {
    console.error("Invalid PDF: No PDF header found");
    return false;
  }
  
  return true;
};

export const mergePdfs = async (buffers: Uint8Array[]) => {
  console.log("mergePdfs called with", buffers.length, "buffers");
  console.log("Buffer sizes:", buffers.map(b => b.length));
  
  const validBuffers = buffers.filter(validatePdfBuffer);
  if (validBuffers.length === 0) {
    throw new Error("No valid PDF buffers provided");
  }
  
  console.log("Valid buffers:", validBuffers.length);
  
  const out = await PDFDocument.create();
  let totalPages = 0;
  
  for (let i = 0; i < validBuffers.length; i++) {
    const buf = validBuffers[i];
    try {
      console.log(`Processing buffer ${i + 1}/${validBuffers.length} (${buf.length} bytes)`);
      const src = await PDFDocument.load(buf, { ignoreEncryption: false });
      const pageCount = src.getPageCount();
      console.log(`Source document has ${pageCount} pages`);
      
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(p => out.addPage(p));
      totalPages += pageCount;
      console.log(`Added ${pageCount} pages, total now: ${totalPages}`);
    } catch (error) {
      console.error(`Error loading PDF ${i + 1} during merge:`, error);
      throw error;
    }
  }
  
  const result = await out.save();
  console.log(`Merge completed. Output: ${result.length} bytes, ${totalPages} total pages`);
  return result;
};

export const extractPages = async (buffer: Uint8Array, indices: number[]) => {
  if (!validatePdfBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
  
  const src = await PDFDocument.load(buffer);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach(p => out.addPage(p));
  return out.save();
};

export const insertBlankPage = async (buffer: Uint8Array, at: number, width = 595, height = 842) => {
  const doc = buffer.byteLength > 0 && validatePdfBuffer(buffer) 
    ? await PDFDocument.load(buffer) 
    : await PDFDocument.create();
  doc.insertPage(at, [width, height]);
  return doc.save();
};

export const addTextBox = async (buffer: Uint8Array, pageIndex: number, text: string, x: number, y: number, size = 12) => {
  if (!validatePdfBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
  
  const doc = await PDFDocument.load(buffer);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  
  if (pageIndex >= doc.getPageCount() || pageIndex < 0) {
    throw new Error(`Page index ${pageIndex} is out of range. Document has ${doc.getPageCount()} pages.`);
  }
  
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
  if (!validatePdfBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
  
  const doc = await PDFDocument.load(buffer);
  
  if (pageIndex >= doc.getPageCount() || pageIndex < 0) {
    throw new Error(`Page index ${pageIndex} is out of range. Document has ${doc.getPageCount()} pages.`);
  }
  
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
  if (!validatePdfBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
  
  const doc = await PDFDocument.load(buffer);
  
  if (pageIndex >= doc.getPageCount() || pageIndex < 0) {
    throw new Error(`Page index ${pageIndex} is out of range. Document has ${doc.getPageCount()} pages.`);
  }
  
  const page = doc.getPage(pageIndex);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    page.drawLine({ start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y }, thickness });
  }
  return doc.save();
};

export const rotatePage = async (buffer: Uint8Array, pageIndex: number, angle = 90) => {
  console.log(`rotatePage called: pageIndex=${pageIndex}, angle=${angle}, bufferSize=${buffer.length}`);
  
  if (!validatePdfBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
  
  const doc = await PDFDocument.load(buffer);
  console.log(`PDF loaded successfully, pages: ${doc.getPageCount()}`);
  
  if (pageIndex >= doc.getPageCount() || pageIndex < 0) {
    throw new Error(`Page index ${pageIndex} is out of range. Document has ${doc.getPageCount()} pages.`);
  }
  
  const page = doc.getPage(pageIndex);
  const currentRotation = page.getRotation().angle;
  console.log(`Current rotation: ${currentRotation} degrees`);
  
  const newRotation = ((currentRotation + angle) % 360 + 360) % 360;
  console.log(`Setting new rotation: ${newRotation} degrees`);
  
  page.setRotation(degrees(newRotation));
  
  const result = await doc.save();
  console.log(`Page rotation saved, new buffer size: ${result.length}`);
  return result;
};

export const rotatePages = async (buffer: Uint8Array, pageIndices: number[], angle = 90) => {
  console.log(`rotatePages called: pageIndices=[${pageIndices.join(', ')}], angle=${angle}, bufferSize=${buffer.length}`);
  
  if (!validatePdfBuffer(buffer)) {
    throw new Error("Invalid PDF buffer");
  }
  
  const doc = await PDFDocument.load(buffer);
  const pageCount = doc.getPageCount();
  console.log(`PDF loaded successfully, pages: ${pageCount}`);
  
  // Validate all page indices
  for (const pageIndex of pageIndices) {
    if (pageIndex >= pageCount || pageIndex < 0) {
      throw new Error(`Page index ${pageIndex} is out of range. Document has ${pageCount} pages.`);
    }
  }
  
  // Rotate all specified pages
  for (const pageIndex of pageIndices) {
    const page = doc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    const newRotation = ((currentRotation + angle) % 360 + 360) % 360;
    
    console.log(`Rotating page ${pageIndex + 1}: ${currentRotation}° → ${newRotation}°`);
    page.setRotation(degrees(newRotation));
  }
  
  const result = await doc.save();
  console.log(`Multiple pages rotation saved, new buffer size: ${result.length}`);
  return result;
};
