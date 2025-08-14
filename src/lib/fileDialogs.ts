export const openPdfFiles = async (): Promise<{ name: string; path?: string; data: Uint8Array }[] | null> => {
  // @ts-ignore - window.electronAPI is added by preload script
  return await window.electronAPI.openPdf();
};

export const savePdfFile = async (name: string, data: Uint8Array): Promise<string | null> => {
  // @ts-ignore - window.electronAPI is added by preload script
  return await window.electronAPI.savePdf(name, data);
};

// @ts-ignore - window.electronAPI is added by preload script
export const showInFolder = async (p: string) => window.electronAPI.showInFolder(p);
