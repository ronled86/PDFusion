import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BufferService } from '../services/BufferService';
import { PDFOperationsService } from '../services/PDFOperationsService';
import { PrintService } from '../services/PrintService';
import { openPdfFiles, savePdfFile, savePdfFileAs, showInFolder } from '../lib/fileDialogs';

export const usePDFOperations = () => {
  const { state, dispatch } = useAppContext();

  const showNotification = useCallback((message: string) => {
    dispatch({ type: 'SET_NOTIFICATION', payload: message });
    setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 3000);
  }, [dispatch]);

  const openFiles = useCallback(async () => {
    try {
      const arr = await openPdfFiles();
      if (arr && arr.length === 1) {
        console.log("Setting single file:", arr[0].name);
        // Create a safe buffer that won't be detached
        const safeBuffer = BufferService.createSafeBuffer(arr[0].data);
        const fileWithSafeData = { ...arr[0], data: safeBuffer };
        
        dispatch({ type: 'SET_FILE', payload: fileWithSafeData });
        dispatch({ type: 'SET_BUFFERS', payload: safeBuffer });
        dispatch({ type: 'SET_PAGE_INDEX', payload: 0 });
        dispatch({ type: 'SET_ZOOM', payload: 0.85 }); // Set initial zoom to fit page
        dispatch({ type: 'SET_FIRST_LOAD', payload: true });
        showNotification("File loaded successfully");
      } else if (arr && arr.length > 1) {
        // Handle multiple files - could implement merge dialog here
        showNotification(`Selected ${arr.length} files. Multi-file operations coming soon.`);
      }
    } catch (error) {
      console.error("Error opening files:", error);
      showNotification("Error opening files: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [dispatch, showNotification]);

  const saveFile = useCallback(async () => {
    if (!state.file || !state.buffers) {
      showNotification("No file to save");
      return;
    }

    try {
      const workingData = BufferService.getWorkingBuffer(state.buffers, state.file);
      if (!workingData) {
        showNotification("No working buffer available. Please reload the document.");
        return;
      }

      if (window.electronAPI && state.file.path) {
        // Electron mode with file path - save to original location
        // The Electron backend should handle overwrite confirmation
        const saved = await savePdfFile(state.file.name, workingData);
        if (saved) {
          showNotification("File saved successfully");
        }
      } else {
        // Browser mode or no path - use Save As instead
        showNotification("No original file path available. Please use Save As.");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      showNotification("Error saving file: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.file, state.buffers, showNotification]);

  const saveAsFile = useCallback(async () => {
    if (!state.file || !state.buffers) {
      showNotification("No file to save");
      return;
    }

    try {
      const workingData = BufferService.getWorkingBuffer(state.buffers, state.file);
      if (!workingData) {
        showNotification("No working buffer available. Please reload the document.");
        return;
      }

      const baseName = state.file.name.replace(/\.pdf$/i, "");
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const suggestedName = `${baseName}_edited_${timestamp}.pdf`;

      const saved = await savePdfFileAs(suggestedName, workingData);
      if (saved) {
        showNotification(`File saved as: ${saved}`);
      }
    } catch (error) {
      console.error("Error saving file:", error);
      showNotification("Error saving file: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.file, state.buffers, showNotification]);

  const printFile = useCallback(async () => {
    await PrintService.handlePrint(state.buffers, state.file, showNotification);
  }, [state.buffers, state.file, showNotification]);

  const showFileInFolder = useCallback(async () => {
    if (!state.file) {
      showNotification("No file is currently open");
      return;
    }

    if (!state.file.path) {
      showNotification("File has no saved location. Please save the file first to show it in folder.");
      return;
    }

    // Show the file location dialog instead of immediately opening folder
    dispatch({ type: 'SET_FILE_LOCATION_DIALOG', payload: true });
  }, [state.file, dispatch]);

  const openFileInFolder = useCallback(async () => {
    if (!state.file?.path) {
      showNotification("No file path available");
      return;
    }

    try {
      if (window.electronAPI) {
        await showInFolder(state.file.path);
        showNotification("File location opened in file explorer");
        dispatch({ type: 'SET_FILE_LOCATION_DIALOG', payload: false });
      } else {
        showNotification("Show in folder feature is only available in desktop mode");
      }
    } catch (error) {
      console.error("Error showing file in folder:", error);
      showNotification("Error opening file location: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.file, showNotification, dispatch]);

  const rotatePage = useCallback(async (degrees: number = 90) => {
    try {
      const result = await PDFOperationsService.rotatePage(
        state.buffers, 
        state.file, 
        state.pageIndex, 
        degrees
      );
      
      dispatch({ type: 'SET_BUFFERS', payload: result });
      dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
      showNotification("Page rotated successfully");
    } catch (error) {
      console.error("Error rotating page:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("detached") || errorMessage.includes("reload")) {
        showNotification("Buffer error - please reload the document and try again");
      } else {
        showNotification("Error rotating page: " + errorMessage);
      }
    }
  }, [state.buffers, state.file, state.pageIndex, dispatch, showNotification]);

  const rotatePages = useCallback(async (pageIndices: number[], degrees: number = 90) => {
    try {
      const result = await PDFOperationsService.rotatePages(
        state.buffers, 
        state.file, 
        pageIndices, 
        degrees
      );
      
      dispatch({ type: 'SET_BUFFERS', payload: result });
      dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
      showNotification(`${pageIndices.length} pages rotated successfully`);
    } catch (error) {
      console.error("Error rotating pages:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("detached") || errorMessage.includes("reload")) {
        showNotification("Buffer error - please reload the document and try again");
      } else {
        showNotification("Error rotating pages: " + errorMessage);
      }
    }
  }, [state.buffers, state.file, dispatch, showNotification]);

  const deletePage = useCallback(async (pageIndex: number) => {
    try {
      const result = await PDFOperationsService.deletePage(
        state.buffers, 
        state.file, 
        pageIndex
      );
      
      dispatch({ type: 'SET_BUFFERS', payload: result });
      dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
      
      // Adjust current page if necessary
      if (state.pageIndex >= pageIndex && state.pageIndex > 0) {
        dispatch({ type: 'SET_PAGE_INDEX', payload: state.pageIndex - 1 });
      }
      
      showNotification(`Page ${pageIndex + 1} deleted successfully`);
    } catch (error) {
      console.error("Error deleting page:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("detached") || errorMessage.includes("reload")) {
        showNotification("Buffer error - please reload the document and try again");
      } else {
        showNotification("Error deleting page: " + errorMessage);
      }
    }
  }, [state.buffers, state.file, state.pageIndex, dispatch, showNotification]);

  const addText = useCallback(async (text: string) => {
    try {
      const result = await PDFOperationsService.addText(
        state.buffers, 
        state.file, 
        state.pageIndex, 
        text
      );
      
      dispatch({ type: 'SET_BUFFERS', payload: result });
      dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
      showNotification("Text added successfully");
    } catch (error) {
      console.error("Error adding text:", error);
      showNotification("Error adding text: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.buffers, state.file, state.pageIndex, dispatch, showNotification]);

  const addHighlight = useCallback(async (text: string) => {
    try {
      const result = await PDFOperationsService.addHighlight(
        state.buffers, 
        state.file, 
        state.pageIndex, 
        text
      );
      
      dispatch({ type: 'SET_BUFFERS', payload: result });
      dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
      showNotification("Highlight added successfully");
    } catch (error) {
      console.error("Error adding highlight:", error);
      showNotification("Error adding highlight: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.buffers, state.file, state.pageIndex, dispatch, showNotification]);

  const addSignature = useCallback(async (imageFile: File, x: number = 100, y: number = 100) => {
    try {
      if (!state.file || !state.buffers) {
        throw new Error("No document loaded");
      }

      const imageBytes = new Uint8Array(await imageFile.arrayBuffer());
      const result = await PDFOperationsService.addSignature(
        state.buffers, 
        state.file, 
        state.pageIndex, 
        imageBytes,
        x,
        y
      );
      
      dispatch({ type: 'SET_BUFFERS', payload: result });
      dispatch({ type: 'SET_FILE', payload: state.file ? { ...state.file, data: result } : undefined });
      showNotification("Signature added successfully");
    } catch (error) {
      console.error("Error adding signature:", error);
      showNotification("Error adding signature: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.buffers, state.file, state.pageIndex, dispatch, showNotification]);

  const extractPages = useCallback(async (pageIndices: number[]) => {
    try {
      if (!state.file || !state.buffers) {
        throw new Error("No document loaded");
      }

      const result = await PDFOperationsService.extractPagesFromDocument(
        state.buffers, 
        state.file, 
        pageIndices
      );
      
      // Save the extracted pages as a new file
      const baseName = state.file.name.replace(/\.pdf$/i, "");
      const pageNumbers = pageIndices.map(i => i + 1).join('-');
      const extractedFileName = `${baseName}_pages_${pageNumbers}.pdf`;
      
      // Import the file dialog function
      const { savePdfFileAs } = await import('../lib/fileDialogs');
      const saved = await savePdfFileAs(extractedFileName, result);
      
      if (saved) {
        showNotification(`Pages ${pageNumbers} extracted to: ${saved}`);
      }
    } catch (error) {
      console.error("Error extracting pages:", error);
      showNotification("Error extracting pages: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.buffers, state.file, showNotification]);

  const performOCR = useCallback(async () => {
    try {
      if (!state.file || !state.buffers) {
        throw new Error("No document loaded");
      }

      showNotification("Starting OCR on current page...");
      const result = await PDFOperationsService.performOCR(
        state.buffers, 
        state.file, 
        state.pageIndex
      );
      
      if (result.length > 0) {
        // For now, just show the extracted text in a notification
        // Later this could be enhanced to show in a dialog or overlay on the PDF
        const textPreview = result.substring(0, 100) + (result.length > 100 ? "..." : "");
        showNotification(`OCR completed. Found text: "${textPreview}"`);
        
        // Optionally copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(result);
          setTimeout(() => showNotification("OCR text copied to clipboard"), 1000);
        }
      } else {
        showNotification("OCR completed but no text was found on this page");
      }
    } catch (error) {
      console.error("Error performing OCR:", error);
      showNotification("Error performing OCR: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.buffers, state.file, state.pageIndex, showNotification]);

  const refreshDocument = useCallback(async () => {
    if (!state.file?.path) {
      showNotification("No file path available for refresh");
      return;
    }

    try {
      if (window.electronAPI) {
        const data = await window.electronAPI!.readFileAsUint8Array(state.file.path);
        const fileData = BufferService.createSafeBuffer(data);
        dispatch({ type: 'SET_FILE', payload: { ...state.file, data: fileData } });
        dispatch({ type: 'SET_BUFFERS', payload: fileData });
        // Preserve current page position
        showNotification("Document refreshed from file system");
      } else {
        showNotification("Refresh not available in browser mode");
      }
    } catch (error) {
      console.error("Error refreshing document:", error);
      showNotification("Error refreshing document: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.file, dispatch, showNotification]);

  return {
    openFiles,
    saveFile,
    saveAsFile,
    printFile,
    showFileInFolder,
    rotatePage,
    rotatePages,
    deletePage,
    addText,
    addHighlight,
    addSignature,
    extractPages,
    performOCR,
    refreshDocument,
    showNotification
  };
};
