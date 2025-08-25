import { pdfjs, initializePdfJs } from "./pdfConfig";

// Initialize PDF.js configuration
initializePdfJs();

export const loadPdf = async (data: Uint8Array) => {
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  return doc;
};

export const createRenderTask = async (
  pdf: pdfjs.PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  canvas: HTMLCanvasElement
) => {
  if (!pdf) {
    throw new Error("PDF document is not loaded");
  }
  
  const pageCount = pdf.numPages;
  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Invalid page index ${pageIndex}. Document has ${pageCount} pages (0-${pageCount - 1})`);
  }
  
  const page = await pdf.getPage(pageIndex + 1); // PDF.js uses 1-based indexing
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext("2d")!;
  
  if (!ctx) {
    throw new Error("Could not get canvas 2D context");
  }
  
  // Set canvas dimensions
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  
  // Clear the canvas before rendering
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const renderCtx = { canvasContext: ctx, viewport };
  const renderTask = page.render(renderCtx);
  
  return {
    renderTask,
    page,
    viewport,
    dimensions: { width: viewport.width, height: viewport.height }
  };
};

export const renderPageToCanvas = async (
  pdf: pdfjs.PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  canvas: HTMLCanvasElement
) => {
  if (!pdf) {
    throw new Error("PDF document is not loaded");
  }
  
  const pageCount = pdf.numPages;
  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Invalid page index ${pageIndex}. Document has ${pageCount} pages (0-${pageCount - 1})`);
  }
  
  try {
    const page = await pdf.getPage(pageIndex + 1); // PDF.js uses 1-based indexing
    const viewport = page.getViewport({ scale });
    const ctx = canvas.getContext("2d")!;
    
    if (!ctx) {
      throw new Error("Could not get canvas 2D context");
    }
    
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    
    // Clear the canvas before rendering
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const renderCtx = { canvasContext: ctx, viewport };
    const renderTask = page.render(renderCtx);
    
    await renderTask.promise;
    
    // Clean up the page to free memory
    page.cleanup();
    
    return { 
      width: viewport.width, 
      height: viewport.height
    };
  } catch (error) {
    console.error(`Error rendering page ${pageIndex}:`, error);
    throw error;
  }
};

export const extractTextRects = async (pdf: pdfjs.PDFDocumentProxy, pageIndex: number, query: string) => {
  if (!pdf) {
    throw new Error("PDF document is not loaded");
  }
  
  const pageCount = pdf.numPages;
  if (pageIndex < 0 || pageIndex >= pageCount) {
    throw new Error(`Invalid page index ${pageIndex}. Document has ${pageCount} pages (0-${pageCount - 1})`);
  }
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  try {
    const page = await pdf.getPage(pageIndex + 1); // PDF.js uses 1-based indexing
    const content = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    const pageHeight = viewport.height;
    const norm = (s: string) => s.toLowerCase();
    type Hit = { x: number; y: number; w: number; h: number; text?: string; start?: number; end?: number };
    const hits: Hit[] = [];

    for (const item of content.items as any[]) {
      if (!item.str) continue;
      const full = String(item.str);
      const s = norm(full);
      const q = norm(query);
      if (!s.includes(q)) continue;

      // PDF.js text coordinates are in a bottom-left origin space.
      // Convert to top-left origin space matching our overlays.
      const hasTransform = Array.isArray(item.transform) && item.transform.length >= 6;
      const xLeft = hasTransform ? item.transform[4] : 0;
      const yTop = hasTransform ? (pageHeight - item.transform[5]) : 0;
      const wTotal = item.width ?? Math.abs(hasTransform ? item.transform[0] : 0);
      const h = item.height ?? Math.abs(hasTransform ? item.transform[3] : 0);

      // Support multiple matches within the same item by proportional width approximation
      let fromIndex = 0;
      while (true) {
        const idx = s.indexOf(q, fromIndex);
        if (idx === -1) break;
        const startRatio = full.length > 0 ? idx / full.length : 0;
        const endRatio = full.length > 0 ? (idx + q.length) / full.length : 0;
        const x = xLeft + wTotal * startRatio;
        const w = Math.max(1, wTotal * (endRatio - startRatio));
        hits.push({ x, y: yTop, w, h, text: full, start: idx, end: idx + q.length });
        fromIndex = idx + q.length;
      }
    }

    // Clean up the page to free memory
    page.cleanup();

  return hits;
  } catch (error) {
    console.error(`Error extracting text from page ${pageIndex}:`, error);
    throw error;
  }
};
