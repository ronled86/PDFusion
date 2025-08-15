export const openPdfFiles = async (): Promise<{ name: string; path?: string; data: Uint8Array }[] | null> => {
  if (window.electronAPI) {
    // Electron mode - returns the files directly from the main process
    const result = await window.electronAPI.openPdf();
    return result;
  } else {
    // Browser mode - use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.multiple = true;
      
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          resolve(null);
          return;
        }

        const results: { name: string; path?: string; data: Uint8Array }[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const arrayBuffer = await file.arrayBuffer();
          // Create a safe, detachment-resistant copy immediately
          const sourceArray = new Uint8Array(arrayBuffer);
          const safeArray = new Uint8Array(sourceArray.length);
          safeArray.set(sourceArray);
          
          results.push({
            name: file.name,
            data: safeArray
          });
        }
        
        resolve(results);
      };
      
      input.onclick = () => {
        input.value = ''; // Reset to allow selecting the same file again
      };
      
      input.click();
    });
  }
};

export const savePdfFile = async (name: string, data: Uint8Array): Promise<string | null> => {
  if (window.electronAPI) {
    // Electron mode - returns the file path or null
    const result = await window.electronAPI.savePdf(name, data);
    return result;
  } else {
    // Browser mode - download file
    const safeData = new Uint8Array(data);
    const blob = new Blob([safeData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return name; // Return the filename as success indicator
  }
};

export const savePdfFileAs = async (defaultName: string, data: Uint8Array): Promise<string | null> => {
  if (window.electronAPI) {
    // Electron mode - show save dialog with file picker
    const result = await window.electronAPI.savePdfAs(defaultName, data);
    return result;
  } else {
    // Browser mode - prompt for filename and download
    return new Promise((resolve) => {
      const fileName = prompt('Enter filename:', defaultName);
      if (!fileName) {
        resolve(null);
        return;
      }
      
      // Ensure .pdf extension
      const finalName = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
      
      const safeData = new Uint8Array(data);
      const blob = new Blob([safeData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      resolve(finalName);
    });
  }
};

export const showInFolder = async (p: string) => {
  if (window.electronAPI) {
    return window.electronAPI.showInFolder(p);
  } else {
    console.warn('showInFolder not available in browser mode');
    throw new Error('Show in folder is not available in browser mode');
  }
};
