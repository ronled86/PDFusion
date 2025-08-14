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
   * Handle print in Browser environment with Hebrew text support
   */
  private static async handleBrowserPrint(
    printBuffer: Uint8Array,
    fileName: string,
    showNotification: (message: string) => void
  ): Promise<void> {
    console.log("Browser print mode");
    
    // Create blob URL for print preview
    const blob = new Blob([new Uint8Array(printBuffer)], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    
    try {
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (!printWindow) {
        showNotification("Could not open print window. Please check your popup blocker.");
        URL.revokeObjectURL(pdfUrl);
        return;
      }

      printWindow.document.write(this.generatePrintHTML(fileName, pdfUrl));
      printWindow.document.close();
      
      // Clean up the blob URL after some time
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 60000);
      
    } catch (error) {
      console.error("Error creating PDF blob for printing:", error);
      showNotification("Error preparing PDF for printing: " + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Generate HTML for print preview with Hebrew text support
   */
  private static generatePrintHTML(fileName: string, pdfUrl: string): string {
    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print Preview - ${fileName}</title>
          <style>
            * {
              box-sizing: border-box;
              unicode-bidi: plaintext;
              font-family: Arial, "David", "Tahoma", "Times New Roman", sans-serif;
            }
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              direction: ltr;
              unicode-bidi: plaintext;
            }
            .container {
              display: flex;
              flex-direction: column;
              height: 100vh;
            }
            .toolbar {
              background: #f0f0f0;
              padding: 10px;
              border-bottom: 1px solid #ccc;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .toolbar button {
              padding: 8px 16px;
              margin-left: 10px;
              border: 1px solid #ccc;
              background: #fff;
              cursor: pointer;
              border-radius: 4px;
            }
            .toolbar button:hover {
              background: #e0e0e0;
            }
            iframe { 
              flex: 1;
              border: none; 
              width: 100%;
              unicode-bidi: plaintext;
            }
            /* Hebrew text support */
            .rtl-support {
              direction: rtl;
              text-align: right;
              unicode-bidi: embed;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="toolbar">
              <span>Print Preview - ${fileName}</span>
              <div>
                <button onclick="window.print()">Print PDF</button>
                <button onclick="window.close()">Close</button>
              </div>
            </div>
            <iframe src="${pdfUrl}" id="pdfFrame"></iframe>
          </div>
          <script>
            // Set document direction and encoding for Hebrew support
            document.documentElement.setAttribute('dir', 'auto');
            document.documentElement.setAttribute('lang', 'he');
            document.charset = 'UTF-8';
            
            document.getElementById('pdfFrame').onload = function() {
              console.log('PDF loaded in iframe');
              
              // Try to set proper encoding and direction for the iframe content
              try {
                const iframeDoc = document.getElementById('pdfFrame').contentDocument;
                if (iframeDoc) {
                  iframeDoc.documentElement.setAttribute('dir', 'auto');
                  iframeDoc.documentElement.setAttribute('lang', 'he');
                  const meta = iframeDoc.createElement('meta');
                  meta.setAttribute('charset', 'UTF-8');
                  if (iframeDoc.head) {
                    iframeDoc.head.appendChild(meta);
                  }
                }
              } catch (e) {
                console.log('Could not modify iframe content for Hebrew support:', e);
              }
            };
            
            // Auto-focus the iframe for better print handling
            setTimeout(function() {
              document.getElementById('pdfFrame').contentWindow.focus();
            }, 1000);
          </script>
        </body>
      </html>
    `;
  }
}
