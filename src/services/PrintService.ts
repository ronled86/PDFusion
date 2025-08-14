import { BufferService } from './BufferService';
import { OpenedFile } from '../lib/types';

export class PrintService {
  /**
   * Handle print functionality for both Electron and Browser environments
   */
  static async handlePrint(
    buffers: Uint8Array | null,
    file: OpenedFile | undefined,
    showNotification: (message: string) => void
  ): Promise<void> {
    if (!file || !buffers) {
      showNotification("No file loaded to print");
      return;
    }

    try {
      console.log("Starting print process...");
      
      // Get current buffers state (includes all changes like rotations)
      let workingData: Uint8Array;
      try {
        if (!buffers) {
          showNotification("No PDF data available for printing");
          return;
        }
        buffers.slice(0, 1); // Test if detached
        workingData = buffers;
        console.log("Using current buffers state for printing");
      } catch (e) {
        console.warn("Main buffers detached, falling back to cached buffer");
        const cachedData = BufferService.getWorkingBuffer(buffers, file);
        if (!cachedData) {
          showNotification("Cannot access PDF data for printing. Please reload the document.");
          return;
        }
        workingData = cachedData;
      }

      // Create a safe copy for printing
      const printBuffer = BufferService.createSafeBuffer(workingData);
      console.log("Created safe buffer for printing, size:", printBuffer.length);

      if (window.electronAPI) {
        await this.handleElectronPrint(printBuffer, file.name, showNotification);
      } else {
        await this.handleBrowserPrint(printBuffer, file.name, showNotification);
      }
    } catch (error) {
      console.error("Print error:", error);
      showNotification("Error printing PDF: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Handle print in Electron environment
   */
  private static async handleElectronPrint(
    printBuffer: Uint8Array,
    fileName: string,
    showNotification: (message: string) => void
  ): Promise<void> {
    console.log("Electron print mode - using native print");
    
    try {
      await window.electronAPI!.printPdf(new Uint8Array(printBuffer), fileName);
      console.log("Native print dialog opened successfully");
    } catch (error) {
      console.error("Error with native print:", error);
      showNotification("Error opening print dialog: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Handle print in Browser environment with iframe approach (no popups)
   */
  private static async handleBrowserPrint(
    printBuffer: Uint8Array,
    fileName: string,
    showNotification: (message: string) => void
  ): Promise<void> {
    console.log("Browser print mode");
    
    try {
      // Create blob URL for the PDF
      const blob = new Blob([printBuffer], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      
      // Method 1: Try opening in same tab with print parameter
      try {
        const newTab = window.open(pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0', '_blank');
        if (newTab) {
          showNotification("PDF opened in new tab - use browser's print function (Ctrl+P)");
          
          // Clean up after some time
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 30000);
          return;
        }
      } catch (error) {
        console.log("New tab method failed, trying fallback");
      }
      
      // Method 2: Iframe approach (fallback)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0';
      iframe.src = pdfUrl;
      
      document.body.appendChild(iframe);
      
      let iframeLoaded = false;
      
      // Wait for iframe to load
      iframe.onload = () => {
        if (iframeLoaded) return;
        iframeLoaded = true;
        
        try {
          // Focus the iframe and trigger print
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            showNotification("Print dialog opened");
          }, 500);
          
          // Clean up after printing
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            URL.revokeObjectURL(pdfUrl);
          }, 5000);
        } catch (error) {
          console.error("Error printing from iframe:", error);
          this.fallbackBrowserPrint(pdfUrl, fileName, showNotification);
          // Clean up
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          URL.revokeObjectURL(pdfUrl);
        }
      };
      
      iframe.onerror = () => {
        if (iframeLoaded) return;
        iframeLoaded = true;
        
        console.error("Error loading PDF in iframe");
        this.fallbackBrowserPrint(pdfUrl, fileName, showNotification);
        // Clean up
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(pdfUrl);
      };
      
      // Timeout fallback
      setTimeout(() => {
        if (!iframeLoaded) {
          iframeLoaded = true;
          console.error("Iframe load timeout");
          this.fallbackBrowserPrint(pdfUrl, fileName, showNotification);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          URL.revokeObjectURL(pdfUrl);
        }
      }, 10000);
      
    } catch (error) {
      console.error("Error creating PDF blob for printing:", error);
      showNotification("Error preparing PDF for printing: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Fallback browser print method - download for manual printing
   */
  private static fallbackBrowserPrint(
    pdfUrl: string,
    fileName: string,
    showNotification: (message: string) => void
  ): void {
    try {
      // Create download link as fallback
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification("PDF downloaded - please open it to print");
    } catch (error) {
      console.error("Fallback print method failed:", error);
      showNotification("Print not available in this browser. Please save the file and print manually.");
    }
  }

}
