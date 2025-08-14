import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openPdf: () => ipcRenderer.invoke("dialog:openPdf"),
  savePdf: (name: string, data: Uint8Array) => ipcRenderer.invoke("dialog:savePdf", name, data),
  showInFolder: (p: string) => ipcRenderer.invoke("shell:showItemInFolder", p),
  printPdf: (data: Uint8Array, filename: string) => ipcRenderer.invoke("print:pdf", data, filename),
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (_event, ...args) => func(...args)),
    removeListener: (channel: string, func: (...args: any[]) => void) => ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
  },
  readFileAsUint8Array: (filePath: string) => ipcRenderer.invoke("fs:readFileAsUint8Array", filePath)
});

export {};
