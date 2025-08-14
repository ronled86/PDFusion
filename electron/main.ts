import { app, BrowserWindow, dialog, ipcMain, shell, Menu } from "electron";
const { logToFile } = require("./logger.cjs");
import path from "node:path";
import fs from "node:fs/promises";

// Disable security warnings in development
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

let win: BrowserWindow | null = null;

const createWindow = async () => {
  logToFile("App starting");
  
  try {
    logToFile("Creating BrowserWindow with preload:", path.join(__dirname, "preload.cjs"));
    logToFile("Development mode:", isDev);
    
    win = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true, // Keep enabled for better security
        allowRunningInsecureContent: false, // Keep disabled
        experimentalFeatures: false
      }
    });
    logToFile("BrowserWindow created successfully");

    // Add comprehensive error handling for renderer process
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      logToFile("Failed to load URL:", validatedURL, "Error:", errorCode, errorDescription);
      if (validatedURL.includes('favicon') || validatedURL.includes('apple-touch-icon')) {
        return; // Ignore favicon 404s
      }
    });

    win.webContents.on('did-fail-provisional-load', (event, errorCode, errorDescription, validatedURL) => {
      logToFile("Failed provisional load:", validatedURL, "Error:", errorCode, errorDescription);
    });

    // Enhanced console message filtering
    win.webContents.on('console-message', (event: any, level: any, message: any, line: any, sourceId: any) => {
      // Suppress specific error messages
      if (message.includes('Failed to load resource') || 
          message.includes('404') ||
          message.includes('favicon') ||
          message.includes('localhost/:1') ||
          message.includes('Electron Security Warning') ||
          message.includes('webSecurity') ||
          message.includes('allowRunningInsecureContent') ||
          message.includes('devtools://') ||
          message.includes('Autofill.enable') ||
          message.includes('Autofill.setAddresses')) {
        return;
      }
      
      // Log other console messages for debugging
      logToFile(`Console [${level}]: ${message}`);
    });

    // Handle resource request failures
    win.webContents.session.webRequest.onBeforeRequest((details, callback) => {
      const url = details.url;
      
      // Only block specific problematic requests, NOT the main app URL
      if ((url.includes('favicon') && !url.includes('localhost:')) || 
          url.includes('apple-touch-icon') || 
          (url.includes('manifest.json') && !url.includes('localhost:')) || 
          (url.includes('robots.txt') && !url.includes('localhost:')) ||
          url.endsWith('/:1') ||
          url.includes('service-worker') || 
          url.includes('sw.js')) {
        callback({ cancel: true });
        return;
      }
      callback({});
    });

    // Handle response errors
    win.webContents.session.webRequest.onErrorOccurred((details) => {
      // Suppress devtools-related errors which are normal in development
      if (details.url.includes('devtools://') || 
          details.url.includes('chrome-extension://') ||
          details.error === 'net::ERR_INVALID_URL') {
        return;
      }
      logToFile("Network error occurred:", details.url, "Error:", details.error);
    });

    const devUrl = process.env.VITE_DEV_SERVER_URL;
    logToFile("VITE_DEV_SERVER_URL", devUrl);
    
    if (devUrl) {
      logToFile("Loading dev URL:", devUrl);
      await win.loadURL(devUrl);
      logToFile("Loaded dev URL", devUrl);
      
      // Add debugging to check what actually loaded  
      win.webContents.executeJavaScript(`
        setTimeout(() => {
          console.log('🚀 Checking Vite content after load');
          console.log('Document ready state:', document.readyState);
          console.log('Body exists:', !!document.body);
          console.log('Title:', document.title);
          console.log('URL:', window.location.href);
          console.log('HTML head content length:', document.head ? document.head.innerHTML.length : 'NO HEAD');
          console.log('HTML body content length:', document.body ? document.body.innerHTML.length : 'NO BODY');
          console.log('Document HTML length:', document.documentElement.outerHTML.length);
          console.log('Document HTML preview (first 200 chars):', document.documentElement.outerHTML.substring(0, 200));
          
          const root = document.getElementById('root');
          console.log('Root element exists:', !!root);
          if (root) {
            console.log('Root innerHTML length:', root.innerHTML.length);
            console.log('Root children count:', root.children.length);
            console.log('Root content preview:', root.innerHTML.substring(0, 100));
          }
          
          // Check scripts
          const scripts = document.querySelectorAll('script');
          console.log('Script tags count:', scripts.length);
          
          return JSON.stringify({
            readyState: document.readyState,
            hasBody: !!document.body,
            hasRoot: !!document.getElementById('root'),
            title: document.title,
            url: window.location.href,
            documentHtmlLength: document.documentElement.outerHTML.length,
            rootContent: root ? root.innerHTML.substring(0, 50) : 'NO ROOT',
            scriptsCount: scripts.length
          });
        }, 2000);
      `).then(result => {
        logToFile(`🔍 Vite Debug Info: ${result}`);
      }).catch(err => {
        logToFile(`❌ Failed to execute debug script: ${err.message}`);
      });
      
      win.webContents.openDevTools({ mode: "detach" });
    } else {
      logToFile("Loading production index.html");
      await win.loadFile(path.join(__dirname, "../dist/index.html"));
      logToFile("Loaded production index.html");
    }
  // Native menu with File > Open
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open",
          async click() {
            logToFile("Menu File > Open clicked");
            if (!win) {
              logToFile("Error: No window available for dialog");
              return;
            }
            try {
              logToFile("Opening file dialog...");
              const res = await dialog.showOpenDialog(win, {
                filters: [{ name: "PDF", extensions: ["pdf"] }],
                properties: ["openFile", "multiSelections"]
              });
              logToFile("Dialog result:", { canceled: res.canceled, filePaths: res.filePaths });
              if (!res.canceled && res.filePaths.length > 0) {
                logToFile("Sending file paths to renderer:", res.filePaths);
                win.webContents.send("menu-open-pdf", res.filePaths);
              }
            } catch (error) {
              logToFile("Error in file dialog:", error);
            }
          }
        },
        { role: "quit" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        {
          label: "Toggle Developer Tools",
          accelerator: "F12",
          click() {
            if (win) {
              win.webContents.toggleDevTools();
            }
          }
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  logToFile("Menu created and set");
  
  } catch (error) {
    logToFile("Error during window creation", error);
    throw error;
  }
};

app.whenReady().then(createWindow).catch(e => logToFile("App failed to start", e));
app.on("window-all-closed", () => { logToFile("All windows closed"); if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { logToFile("App activated"); if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// File I/O
ipcMain.handle("dialog:openPdf", async () => {
  logToFile("Open PDF dialog triggered");
  const res = await dialog.showOpenDialog(win!, {
    filters: [{ name: "PDF", extensions: ["pdf"] }],
    properties: ["openFile", "multiSelections"]
  });
  if (res.canceled) { logToFile("Open PDF dialog canceled"); return null; }
  const files = await Promise.all(res.filePaths.map(async p => ({
    name: path.basename(p),
    path: p,
    data: await fs.readFile(p)
  })));
  logToFile("PDF files opened", files.map(f => f.name));
  return files;
});

ipcMain.handle("dialog:savePdf", async (_evt, suggestedName: string, data: Uint8Array) => {
  logToFile("Save PDF dialog triggered", suggestedName);
  const res = await dialog.showSaveDialog(win!, {
    defaultPath: suggestedName,
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  if (res.canceled || !res.filePath) { logToFile("Save PDF dialog canceled"); return null; }
  await fs.writeFile(res.filePath, data);
  logToFile("PDF file saved", res.filePath);
  return res.filePath;
});

ipcMain.handle("shell:showItemInFolder", async (_evt, p: string) => {
  logToFile("Show item in folder", p);
  shell.showItemInFolder(p);
});

// Handle PDF printing with native Electron print dialog
ipcMain.handle("print:pdf", async (_evt, data: Uint8Array, filename: string) => {
  logToFile("Print PDF requested", filename);
  
  try {
    // Create a temporary file for the PDF
    const tmpDir = require('os').tmpdir();
    const tmpPath = path.join(tmpDir, `print_${Date.now()}_${filename}`);
    
    // Write PDF data to temp file
    await fs.writeFile(tmpPath, data);
    logToFile("Temporary PDF file created", tmpPath);
    
    // Create a new window for printing
    const printWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false // Allow file:// URLs for printing
      },
      show: false
    });
    
    // Load the PDF file
    await printWindow.loadFile(tmpPath);
    
    // Wait a bit for the PDF to load, then show print dialog
    setTimeout(async () => {
      try {
        await printWindow.webContents.print({
          silent: false,
          printBackground: true,
          margins: { marginType: 'none' }
        });
        logToFile("Print dialog opened successfully");
        
        // Clean up temp file after printing
        setTimeout(async () => {
          try {
            await fs.unlink(tmpPath);
            logToFile("Temporary file cleaned up", tmpPath);
          } catch (e) {
            logToFile("Error cleaning up temp file", e);
          }
          printWindow.close();
        }, 5000);
        
      } catch (printError) {
        logToFile("Error opening print dialog", printError);
        printWindow.close();
        await fs.unlink(tmpPath);
        throw printError;
      }
    }, 1000);
    
    return true;
  } catch (error) {
    logToFile("Error in PDF printing", error);
    throw error;
  }
});

// Handle file reading for preload script
ipcMain.handle("fs:readFileAsUint8Array", async (_evt, filePath: string) => {
  try {
    logToFile("Reading file as Uint8Array", filePath);
    const data = await fs.readFile(filePath);
    logToFile("File read successfully", filePath, "size:", data.length);
    return new Uint8Array(data);
  } catch (error) {
    logToFile("Error reading file", filePath, error);
    throw error;
  }
});

process.on("uncaughtException", (err) => {
  logToFile("Uncaught Exception", err);
});

process.on("unhandledRejection", (reason, promise) => {
  logToFile("Unhandled Rejection", reason);
});
