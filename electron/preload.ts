import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openPdf: () => ipcRenderer.invoke("dialog:openPdf"),
  savePdf: (name: string, data: Uint8Array) => ipcRenderer.invoke("dialog:savePdf", name, data),
  showInFolder: (p: string) => ipcRenderer.invoke("shell:showItemInFolder", p)
});

export {};
