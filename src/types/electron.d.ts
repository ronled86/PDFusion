interface ElectronAPI {
  openPdf: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  savePdf: (name: string, data: Uint8Array) => Promise<{ canceled: boolean; filePath?: string }>;
  showInFolder: (path: string) => Promise<void>;
  printPdf: (data: Uint8Array, filename: string) => Promise<boolean>;
  readFileAsUint8Array: (filePath: string) => Promise<Uint8Array>;
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => void;
    removeListener: (channel: string, func: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
}

interface Window {
  electronAPI?: ElectronAPI;
}
