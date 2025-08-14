// PDF.js worker configuration for development
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
export const initializePdfJs = () => {
  if (typeof window !== "undefined") {
    // Use the worker file copied by vite-plugin-static-copy
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    console.log("PDF.js initialized with local worker file");
  }
};

export { pdfjs };
