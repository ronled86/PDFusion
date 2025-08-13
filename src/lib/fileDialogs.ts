export const openPdfFiles = async (): Promise<{ name: string; path?: string; data: Uint8Array }[] | null> => {
  // @ts-expect-error
  return await window.electronAPI.openPdf();
};

export const savePdfFile = async (name: string, data: Uint8Array): Promise<string | null> => {
  // @ts-expect-error
  return await window.electronAPI.savePdf(name, data);
};

// @ts-expect-error
export const showInFolder = async (p: string) => window.electronAPI.showInFolder(p);
