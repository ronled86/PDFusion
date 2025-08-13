import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import fs from "node:fs/promises";

let win: BrowserWindow | null = null;

const createWindow = async () => {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    await win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  win.on("closed", () => { win = null; });
};

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// File I/O
ipcMain.handle("dialog:openPdf", async () => {
  const res = await dialog.showOpenDialog(win!, {
    filters: [{ name: "PDF", extensions: ["pdf"] }],
    properties: ["openFile", "multiSelections"]
  });
  if (res.canceled) return null;
  const files = await Promise.all(res.filePaths.map(async p => ({
    name: path.basename(p),
    path: p,
    data: await fs.readFile(p)
  })));
  return files;
});

ipcMain.handle("dialog:savePdf", async (_evt, suggestedName: string, data: Uint8Array) => {
  const res = await dialog.showSaveDialog(win!, {
    defaultPath: suggestedName,
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  if (res.canceled || !res.filePath) return null;
  await fs.writeFile(res.filePath, data);
  return res.filePath;
});

ipcMain.handle("shell:showItemInFolder", async (_evt, p: string) => {
  shell.showItemInFolder(p);
});
