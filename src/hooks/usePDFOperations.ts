import { useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BufferService } from '../services/BufferService';
import { PDFOperationsService } from '../services/PDFOperationsService';
import { PrintService } from '../services/PrintService';
import { openPdfFiles, savePdfFile, showInFolder } from '../lib/fileDialogs';

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
        const fileData = BufferService.createSafeBuffer(arr[0].data);
        dispatch({ type: 'SET_FILE', payload: { ...arr[0], data: fileData } });
        dispatch({ type: 'SET_BUFFERS', payload: fileData });
        dispatch({ type: 'SET_PAGE_INDEX', payload: 0 });
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

      if (window.electronAPI) {
        const saved = await savePdfFile(state.file.name, workingData);
        if (saved) {
          showNotification("File saved successfully");
        }
      } else {
        showNotification("Save not available in browser mode. Use Save As instead.");
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

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const baseName = state.file.name.replace(/\.pdf$/i, "");
      const suggestedName = `${baseName}_edited_${timestamp}.pdf`;

      if (window.electronAPI) {
        const saved = await savePdfFile(suggestedName, workingData);
        if (saved) {
          showNotification("File saved successfully");
        }
      } else {
        // Browser download
        const blob = new Blob([new Uint8Array(workingData)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification("File downloaded successfully");
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
    if (!state.file?.path) {
      showNotification("No file path available");
      return;
    }

    try {
      if (window.electronAPI) {
        await showInFolder(state.file.path);
      } else {
        showNotification("Show in folder not available in browser mode");
      }
    } catch (error) {
      console.error("Error showing file in folder:", error);
      showNotification("Error showing file in folder: " + (error instanceof Error ? error.message : String(error)));
    }
  }, [state.file, showNotification]);

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
      showNotification("Error rotating page: " + (error instanceof Error ? error.message : String(error)));
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
    addText,
    refreshDocument,
    showNotification
  };
};
