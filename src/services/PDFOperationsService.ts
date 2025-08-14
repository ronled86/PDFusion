import { 
  addInkPath, 
  addTextBox, 
  addHighlightRects, 
  extractPages, 
  insertBlankPage, 
  mergePdfs, 
  rotatePage,
  rotatePages 
} from '../lib/pdfWrite';
import { extractTextRects, renderPageToCanvas } from '../lib/pdfRender';
import { placeSignatureImage } from '../lib/signature';
import { ocrCanvas } from '../lib/ocr';
import { BufferService } from './BufferService';
import { OpenedFile } from '../lib/types';

export class PDFOperationsService {
  /**
   * Rotate a page by specified degrees
   */
  static async rotatePage(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndex: number, 
    degrees: number = 90
  ): Promise<Uint8Array> {
    console.log("Rotate operation started, degrees:", degrees, "buffers:", buffers?.length, "bytes");
    
    if (!buffers && !file?.data) {
      throw new Error("No document loaded");
    }

    try {
      console.log(`Rotating page ${pageIndex + 1} by ${degrees} degrees`);
      
      // Try multiple buffer sources in order of preference
      let workingData: Uint8Array | null = null;
      
      // First try: current buffers
      if (buffers) {
        try {
          buffers.slice(0, 1); // Test accessibility
          workingData = new Uint8Array(buffers);
          console.log("Using current buffers for rotation");
        } catch (e) {
          console.warn("Current buffers detached, trying alternatives");
        }
      }
      
      // Second try: cached buffer
      if (!workingData) {
        const cachedData = BufferService.getWorkingBuffer(buffers, file);
        if (cachedData) {
          try {
            cachedData.slice(0, 1); // Test accessibility
            workingData = new Uint8Array(cachedData);
            console.log("Using cached buffer for rotation");
          } catch (e) {
            console.warn("Cached buffer also detached");
          }
        }
      }
      
      // Third try: file.data directly
      if (!workingData && file?.data) {
        try {
          file.data.slice(0, 1); // Test accessibility
          workingData = new Uint8Array(file.data);
          console.log("Using file.data for rotation");
        } catch (e) {
          console.warn("File.data also detached");
        }
      }
      
      if (!workingData) {
        throw new Error("All buffer sources are detached. Please reload the document.");
      }
      
      console.log("Working with buffer of size:", workingData.length);
      
      const out = await rotatePage(workingData, pageIndex, degrees);
      console.log("Rotation completed, new buffer size:", out.length);
      
      // Validate the output buffer
      if (!(out instanceof Uint8Array) || out.length === 0) {
        throw new Error("Invalid output from rotation");
      }
      
      // Create a completely fresh copy for state updates
      return BufferService.createSafeUpdate(out);
    } catch (error) {
      console.error("Error during rotation:", error);
      throw new Error("Error rotating page: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Rotate multiple pages by specified degrees
   */
  static async rotatePages(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndices: number[], 
    degrees: number = 90
  ): Promise<Uint8Array> {
    console.log("Multiple pages rotate operation started, degrees:", degrees, "pageIndices:", pageIndices, "buffers:", buffers?.length, "bytes");
    
    if (!buffers && !file?.data) {
      throw new Error("No document loaded");
    }

    if (pageIndices.length === 0) {
      throw new Error("No pages selected for rotation");
    }

    try {
      console.log(`Rotating ${pageIndices.length} pages by ${degrees} degrees`);
      
      // Try multiple buffer sources in order of preference
      let workingData: Uint8Array | null = null;
      
      // First try: current buffers
      if (buffers) {
        try {
          buffers.slice(0, 1); // Test accessibility
          workingData = new Uint8Array(buffers);
          console.log("Using current buffers for rotation");
        } catch (e) {
          console.warn("Current buffers detached, trying alternatives");
        }
      }
      
      // Second try: cached buffer
      if (!workingData) {
        const cachedData = BufferService.getWorkingBuffer(buffers, file);
        if (cachedData) {
          try {
            cachedData.slice(0, 1); // Test accessibility
            workingData = new Uint8Array(cachedData);
            console.log("Using cached buffer for rotation");
          } catch (e) {
            console.warn("Cached buffer also detached");
          }
        }
      }
      
      // Third try: file.data directly
      if (!workingData && file?.data) {
        try {
          file.data.slice(0, 1); // Test accessibility
          workingData = new Uint8Array(file.data);
          console.log("Using file.data for rotation");
        } catch (e) {
          console.warn("File.data also detached");
        }
      }
      
      if (!workingData) {
        throw new Error("All buffer sources are detached. Please reload the document.");
      }
      
      console.log("Working with buffer of size:", workingData.length);
      
      const out = await rotatePages(workingData, pageIndices, degrees);
      console.log("Multiple pages rotation completed, new buffer size:", out.length);
      
      // Validate the output buffer
      if (!(out instanceof Uint8Array) || out.length === 0) {
        throw new Error("Invalid output from rotation");
      }
      
      // Create a completely fresh copy for state updates
      return BufferService.createSafeUpdate(out);
    } catch (error) {
      console.error("Error during multiple pages rotation:", error);
      throw new Error("Error rotating pages: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Add ink stroke to the document
   */
  static async addInkStroke(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndex: number,
    points: {x: number; y: number}[],
    lineWidth: number = 2
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }
    
    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const out = await addInkPath(freshBuffer, pageIndex, points, lineWidth);
      return BufferService.createSafeBuffer(out);
    } catch (error) {
      console.error("Error in ink stroke:", error);
      throw error;
    }
  }

  /**
   * Add text to the document
   */
  static async addText(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndex: number,
    text: string
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const out = await addTextBox(freshBuffer, pageIndex, text, 100, 100);
      return BufferService.createSafeBuffer(out);
    } catch (error) {
      console.error("Error adding text:", error);
      throw error;
    }
  }

  /**
   * Highlight text in the document
   */
  static async highlightText(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pdf: any,
    pageIndex: number,
    searchText: string
  ): Promise<Uint8Array> {
    if (!pdf) {
      throw new Error("PDF not loaded");
    }

    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const rects = await extractTextRects(pdf, pageIndex, searchText);
      if (rects.length === 0) {
        throw new Error(`Text "${searchText}" not found on page ${pageIndex + 1}`);
      }

      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const out = await addHighlightRects(freshBuffer, pageIndex, rects);
      return BufferService.createSafeBuffer(out);
    } catch (error) {
      console.error("Error highlighting text:", error);
      throw error;
    }
  }

  /**
   * Extract specific pages from the document
   */
  static async extractPages(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndices: number[]
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const out = await extractPages(freshBuffer, pageIndices);
      return BufferService.createSafeBuffer(out);
    } catch (error) {
      console.error("Error extracting pages:", error);
      throw error;
    }
  }

  /**
   * Merge multiple PDFs
   */
  static async mergePDFs(
    mainBuffer: Uint8Array | null,
    file: OpenedFile | undefined,
    mergeFiles: OpenedFile[],
    position: 'before' | 'after' | 'replace' = 'after'
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(mainBuffer, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    if (!mergeFiles || mergeFiles.length === 0) {
      throw new Error("No files to merge");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const mergeBuffers = mergeFiles.map(f => BufferService.createSafeBuffer(f.data));
      
      let result: Uint8Array;
      
      switch (position) {
        case 'before':
          // Merge files first, then the current document
          result = await mergePdfs([...mergeBuffers, freshBuffer]);
          break;
        case 'replace':
          // Replace current document with merged files
          result = await mergePdfs(mergeBuffers);
          break;
        case 'after':
        default:
          // Current document first, then merge files
          result = await mergePdfs([freshBuffer, ...mergeBuffers]);
          break;
      }
      
      return BufferService.createSafeBuffer(result);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      throw error;
    }
  }

  /**
   * Add highlight to text in the document
   */
  static async addHighlight(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndex: number,
    searchText: string
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      
      // Load PDF document to extract text rectangles
      const { loadPdf } = await import('../lib/pdfRender');
      const pdfDoc = await loadPdf(freshBuffer);
      
      // Extract text rectangles for the search term
      const highlightRects = await extractTextRects(pdfDoc, pageIndex, searchText);
      
      if (highlightRects.length === 0) {
        throw new Error(`Text "${searchText}" not found on page ${pageIndex + 1}`);
      }
      
      const result = await addHighlightRects(freshBuffer, pageIndex, highlightRects);
      return BufferService.createSafeBuffer(result);
    } catch (error) {
      console.error("Error adding highlight:", error);
      throw error;
    }
  }

  /**
   * Add signature image to the document
   */
  static async addSignature(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndex: number,
    imageBytes: Uint8Array,
    x: number = 100,
    y: number = 100,
    width?: number,
    height?: number
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const result = await placeSignatureImage(
        freshBuffer, 
        pageIndex, 
        imageBytes, 
        x, 
        y, 
        width, 
        height
      );
      return BufferService.createSafeBuffer(result);
    } catch (error) {
      console.error("Error adding signature:", error);
      throw error;
    }
  }

  /**
   * Extract specific pages from the document
   */
  static async extractPagesFromDocument(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndices: number[]
  ): Promise<Uint8Array> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      const result = await extractPages(freshBuffer, pageIndices);
      return BufferService.createSafeBuffer(result);
    } catch (error) {
      console.error("Error extracting pages:", error);
      throw error;
    }
  }

  /**
   * Perform OCR on a specific page
   */
  static async performOCR(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    pageIndex: number,
    language: string = 'eng'
  ): Promise<string> {
    const workingBuffer = BufferService.getWorkingBuffer(buffers, file);
    if (!workingBuffer) {
      throw new Error("No working buffer available");
    }

    try {
      const freshBuffer = BufferService.createSafeBuffer(workingBuffer);
      
      // Load PDF document and create canvas
      const { loadPdf } = await import('../lib/pdfRender');
      const pdfDoc = await loadPdf(freshBuffer);
      
      // Create a canvas element for OCR
      const canvas = document.createElement('canvas');
      const scale = 2.0; // Higher scale for better OCR accuracy
      
      // Render page to canvas
      await renderPageToCanvas(pdfDoc, pageIndex, scale, canvas);
      
      // Perform OCR on the canvas
      const words = await ocrCanvas(canvas, language);
      
      // Combine all words into a single text string
      const extractedText = words.map(word => word.text).join(' ');
      
      return extractedText;
    } catch (error) {
      console.error("Error performing OCR:", error);
      throw error;
    }
  }
}
