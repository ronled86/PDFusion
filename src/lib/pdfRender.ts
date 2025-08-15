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
    
    // Clean up the page to free memory
    page.cleanup();
    
    return hits;
  } catch (error) {
    console.error(`Error extracting text from page ${pageIndex}:`, error);
    throw error;
  }
};
