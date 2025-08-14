import { 
  addInkPath, 
  addTextBox, 
  addHighlightRects, 
  extractPages, 
  insertBlankPage, 
  mergePdfs, 
  rotatePage 
} from '../lib/pdfWrite';
import { extractTextRects } from '../lib/pdfRender';
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
    
    if (!buffers) {
      throw new Error("No document loaded");
    }

    try {
      console.log(`Rotating page ${pageIndex + 1} by ${degrees} degrees`);
      
      // Always create a safe working copy from current buffers
      let workingData: Uint8Array;
      try {
        // Test if main buffers is accessible
        const testSlice = buffers.slice(0, 1);
        workingData = new Uint8Array(buffers); // Create fresh copy immediately
        console.log("Created fresh copy from current buffers state");
      } catch (e) {
        console.warn("Main buffers detached, using cached buffer");
        const cachedData = BufferService.getWorkingBuffer(buffers, file);
        if (!cachedData) {
          throw new Error("No working buffer available. Please reload the document.");
        }
        try {
          cachedData.slice(0, 1); // Test cached buffer
          workingData = new Uint8Array(cachedData); // Create fresh copy
          console.log("Created fresh copy from cached buffer");
        } catch (cacheError) {
          throw new Error("All buffers are corrupted. Please reload the document.");
        }
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
}
