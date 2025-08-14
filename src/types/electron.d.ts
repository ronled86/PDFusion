interface ElectronAPI {
  openPdf: () => Promise<{ name: string; path?: string; data: Uint8Array }[] | null>;
  savePdf: (name: string, data: Uint8Array) => Promise<string | null>;
  savePdfAs: (defaultName: string, data: Uint8Array) => Promise<string | null>;
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
