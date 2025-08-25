"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var logToFile = require("./logger.cjs").logToFile;
var node_path_1 = __importDefault(require("node:path"));
var promises_1 = __importDefault(require("node:fs/promises"));
// Disable security warnings in development
var isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}
var win = null;
var createWindow = function () { return __awaiter(void 0, void 0, void 0, function () {
    var devUrl, template, menu, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logToFile("App starting");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                logToFile("Creating BrowserWindow with preload:", node_path_1.default.join(__dirname, "preload.cjs"));
                logToFile("Development mode:", isDev);
                win = new electron_1.BrowserWindow({
                    width: 1400,
                    height: 900,
                    webPreferences: {
                        preload: node_path_1.default.join(__dirname, "preload.cjs"),
                        nodeIntegration: false,
                        contextIsolation: true,
                        webSecurity: true, // Keep enabled for better security
                        allowRunningInsecureContent: false, // Keep disabled
                        experimentalFeatures: false
                    }
                });
                logToFile("BrowserWindow created successfully");
                // Add comprehensive error handling for renderer process
                win.webContents.on('did-fail-load', function (event, errorCode, errorDescription, validatedURL) {
                    logToFile("Failed to load URL:", validatedURL, "Error:", errorCode, errorDescription);
                    if (validatedURL.includes('favicon') || validatedURL.includes('apple-touch-icon')) {
                        return; // Ignore favicon 404s
                    }
                });
                win.webContents.on('did-fail-provisional-load', function (event, errorCode, errorDescription, validatedURL) {
                    logToFile("Failed provisional load:", validatedURL, "Error:", errorCode, errorDescription);
                });
                // Enhanced console message filtering
                win.webContents.on('console-message', function (event, level, message, line, sourceId) {
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
                    logToFile("Console [".concat(level, "]: ").concat(message));
                });
                // Handle resource request failures
                win.webContents.session.webRequest.onBeforeRequest(function (details, callback) {
                    var url = details.url;
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
                win.webContents.session.webRequest.onErrorOccurred(function (details) {
                    // Suppress devtools-related errors which are normal in development
                    if (details.url.includes('devtools://') ||
                        details.url.includes('chrome-extension://') ||
                        details.error === 'net::ERR_INVALID_URL') {
                        return;
                    }
                    logToFile("Network error occurred:", details.url, "Error:", details.error);
                });
                devUrl = process.env.VITE_DEV_SERVER_URL;
                logToFile("VITE_DEV_SERVER_URL", devUrl);
                if (!devUrl) return [3 /*break*/, 3];
                logToFile("Loading dev URL:", devUrl);
                return [4 /*yield*/, win.loadURL(devUrl)];
            case 2:
                _a.sent();
                logToFile("Loaded dev URL", devUrl);
                // Add debugging to check what actually loaded  
                win.webContents.executeJavaScript("\n        setTimeout(() => {\n          console.log('\uD83D\uDE80 Checking Vite content after load');\n          console.log('Document ready state:', document.readyState);\n          console.log('Body exists:', !!document.body);\n          console.log('Title:', document.title);\n          console.log('URL:', window.location.href);\n          console.log('HTML head content length:', document.head ? document.head.innerHTML.length : 'NO HEAD');\n          console.log('HTML body content length:', document.body ? document.body.innerHTML.length : 'NO BODY');\n          console.log('Document HTML length:', document.documentElement.outerHTML.length);\n          console.log('Document HTML preview (first 200 chars):', document.documentElement.outerHTML.substring(0, 200));\n          \n          const root = document.getElementById('root');\n          console.log('Root element exists:', !!root);\n          if (root) {\n            console.log('Root innerHTML length:', root.innerHTML.length);\n            console.log('Root children count:', root.children.length);\n            console.log('Root content preview:', root.innerHTML.substring(0, 100));\n          }\n          \n          // Check scripts\n          const scripts = document.querySelectorAll('script');\n          console.log('Script tags count:', scripts.length);\n          \n          return JSON.stringify({\n            readyState: document.readyState,\n            hasBody: !!document.body,\n            hasRoot: !!document.getElementById('root'),\n            title: document.title,\n            url: window.location.href,\n            documentHtmlLength: document.documentElement.outerHTML.length,\n            rootContent: root ? root.innerHTML.substring(0, 50) : 'NO ROOT',\n            scriptsCount: scripts.length\n          });\n        }, 2000);\n      ").then(function (result) {
                    logToFile("\uD83D\uDD0D Vite Debug Info: ".concat(result));
                }).catch(function (err) {
                    logToFile("\u274C Failed to execute debug script: ".concat(err.message));
                });
                return [3 /*break*/, 5];
            case 3:
                logToFile("Loading production index.html");
                return [4 /*yield*/, win.loadFile(node_path_1.default.join(__dirname, "../dist/index.html"))];
            case 4:
                _a.sent();
                logToFile("Loaded production index.html");
                _a.label = 5;
            case 5:
                template = [
                    {
                        label: "File",
                        submenu: [
                            {
                                label: "Open",
                                click: function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var res, error_2;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    logToFile("Menu File > Open clicked");
                                                    if (!win) {
                                                        logToFile("Error: No window available for dialog");
                                                        return [2 /*return*/];
                                                    }
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    logToFile("Opening file dialog...");
                                                    return [4 /*yield*/, electron_1.dialog.showOpenDialog(win, {
                                                            filters: [{ name: "PDF", extensions: ["pdf"] }],
                                                            properties: ["openFile", "multiSelections"]
                                                        })];
                                                case 2:
                                                    res = _a.sent();
                                                    logToFile("Dialog result:", { canceled: res.canceled, filePaths: res.filePaths });
                                                    if (!res.canceled && res.filePaths.length > 0) {
                                                        logToFile("Sending file paths to renderer:", res.filePaths);
                                                        win.webContents.send("menu-open-pdf", res.filePaths);
                                                    }
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    error_2 = _a.sent();
                                                    logToFile("Error in file dialog:", error_2);
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    });
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
                                click: function () {
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
                menu = electron_1.Menu.buildFromTemplate(template);
                electron_1.Menu.setApplicationMenu(menu);
                logToFile("Menu created and set");
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                logToFile("Error during window creation", error_1);
                throw error_1;
            case 7: return [2 /*return*/];
        }
    });
}); };
electron_1.app.whenReady().then(createWindow).catch(function (e) { return logToFile("App failed to start", e); });
electron_1.app.on("window-all-closed", function () { logToFile("All windows closed"); if (process.platform !== "darwin")
    electron_1.app.quit(); });
electron_1.app.on("activate", function () { logToFile("App activated"); if (electron_1.BrowserWindow.getAllWindows().length === 0)
    createWindow(); });
// File I/O
electron_1.ipcMain.handle("dialog:openPdf", function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logToFile("Open PDF dialog triggered");
                return [4 /*yield*/, electron_1.dialog.showOpenDialog(win, {
                        filters: [{ name: "PDF", extensions: ["pdf"] }],
                        properties: ["openFile", "multiSelections"]
                    })];
            case 1:
                res = _a.sent();
                if (res.canceled) {
                    logToFile("Open PDF dialog canceled");
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, Promise.all(res.filePaths.map(function (p) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = {
                                        name: node_path_1.default.basename(p),
                                        path: p
                                    };
                                    return [4 /*yield*/, promises_1.default.readFile(p)];
                                case 1: return [2 /*return*/, (_a.data = _b.sent(),
                                        _a)];
                            }
                        });
                    }); }))];
            case 2:
                files = _a.sent();
                logToFile("PDF files opened", files.map(function (f) { return f.name; }));
                return [2 /*return*/, files];
        }
    });
}); });
electron_1.ipcMain.handle("dialog:savePdf", function (_evt, suggestedName, data) { return __awaiter(void 0, void 0, void 0, function () {
    var os, documentsPath, defaultPath, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logToFile("Save PDF triggered", suggestedName);
                os = require('os');
                documentsPath = node_path_1.default.join(os.homedir(), 'Documents');
                defaultPath = node_path_1.default.join(documentsPath, suggestedName);
                return [4 /*yield*/, electron_1.dialog.showSaveDialog(win, {
                        defaultPath: defaultPath,
                        filters: [
                            { name: "PDF Files", extensions: ["pdf"] },
                            { name: "All Files", extensions: ["*"] }
                        ],
                        title: "Save PDF",
                        buttonLabel: "Save",
                        properties: ['showOverwriteConfirmation'] // This enables built-in overwrite confirmation
                    })];
            case 1:
                res = _a.sent();
                if (res.canceled || !res.filePath) {
                    logToFile("Save PDF dialog canceled");
                    return [2 /*return*/, null];
                }
                // Note: With 'showOverwriteConfirmation' property, Electron handles overwrite confirmation automatically
                return [4 /*yield*/, promises_1.default.writeFile(res.filePath, data)];
            case 2:
                // Note: With 'showOverwriteConfirmation' property, Electron handles overwrite confirmation automatically
                _a.sent();
                logToFile("PDF file saved", res.filePath);
                return [2 /*return*/, res.filePath];
        }
    });
}); });
electron_1.ipcMain.handle("dialog:savePdfAs", function (_evt, defaultName, data) { return __awaiter(void 0, void 0, void 0, function () {
    var os, documentsPath, defaultPath, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logToFile("Save PDF As dialog triggered", defaultName);
                os = require('os');
                documentsPath = node_path_1.default.join(os.homedir(), 'Documents');
                defaultPath = node_path_1.default.join(documentsPath, defaultName);
                return [4 /*yield*/, electron_1.dialog.showSaveDialog(win, {
                        defaultPath: defaultPath,
                        filters: [
                            { name: "PDF Files", extensions: ["pdf"] },
                            { name: "All Files", extensions: ["*"] }
                        ],
                        title: "Save PDF As...",
                        buttonLabel: "Save",
                        properties: ['showOverwriteConfirmation'] // This enables built-in overwrite confirmation
                    })];
            case 1:
                res = _a.sent();
                if (res.canceled || !res.filePath) {
                    logToFile("Save PDF As dialog canceled");
                    return [2 /*return*/, null];
                }
                // Note: With 'showOverwriteConfirmation' property, Electron handles overwrite confirmation automatically
                return [4 /*yield*/, promises_1.default.writeFile(res.filePath, data)];
            case 2:
                // Note: With 'showOverwriteConfirmation' property, Electron handles overwrite confirmation automatically
                _a.sent();
                logToFile("PDF file saved as", res.filePath);
                return [2 /*return*/, res.filePath];
        }
    });
}); });
electron_1.ipcMain.handle("shell:showItemInFolder", function (_evt, p) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        logToFile("Show item in folder", p);
        electron_1.shell.showItemInFolder(p);
        return [2 /*return*/];
    });
}); });
// Handle PDF printing with native Electron print dialog
electron_1.ipcMain.handle("print:pdf", function (_evt, data, filename) { return __awaiter(void 0, void 0, void 0, function () {
    var tmpDir, tmpPath_1, printWindow_1, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logToFile("Print PDF requested", filename);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                tmpDir = require('os').tmpdir();
                tmpPath_1 = node_path_1.default.join(tmpDir, "print_".concat(Date.now(), "_").concat(filename));
                // Write PDF data to temp file
                return [4 /*yield*/, promises_1.default.writeFile(tmpPath_1, data)];
            case 2:
                // Write PDF data to temp file
                _a.sent();
                logToFile("Temporary PDF file created", tmpPath_1);
                printWindow_1 = new electron_1.BrowserWindow({
                    width: 1200,
                    height: 800,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        webSecurity: true, // Keep security enabled
                        allowRunningInsecureContent: false
                    },
                    show: false
                });
                // Load the PDF file
                return [4 /*yield*/, printWindow_1.loadFile(tmpPath_1)];
            case 3:
                // Load the PDF file
                _a.sent();
                // Wait a bit for the PDF to load, then show print dialog
                setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var printError_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 4]);
                                return [4 /*yield*/, printWindow_1.webContents.print({
                                        silent: false,
                                        printBackground: true,
                                        margins: { marginType: 'none' }
                                    })];
                            case 1:
                                _a.sent();
                                logToFile("Print dialog opened successfully");
                                // Clean up temp file after printing
                                setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                                    var e_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, promises_1.default.unlink(tmpPath_1)];
                                            case 1:
                                                _a.sent();
                                                logToFile("Temporary file cleaned up", tmpPath_1);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                e_1 = _a.sent();
                                                logToFile("Error cleaning up temp file", e_1);
                                                return [3 /*break*/, 3];
                                            case 3:
                                                printWindow_1.close();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, 5000);
                                return [3 /*break*/, 4];
                            case 2:
                                printError_1 = _a.sent();
                                logToFile("Error opening print dialog", printError_1);
                                printWindow_1.close();
                                return [4 /*yield*/, promises_1.default.unlink(tmpPath_1)];
                            case 3:
                                _a.sent();
                                throw printError_1;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); }, 1000);
                return [2 /*return*/, true];
            case 4:
                error_3 = _a.sent();
                logToFile("Error in PDF printing", error_3);
                throw error_3;
            case 5: return [2 /*return*/];
        }
    });
}); });
// Handle file reading for preload script
electron_1.ipcMain.handle("fs:readFileAsUint8Array", function (_evt, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var data, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                logToFile("Reading file as Uint8Array", filePath);
                return [4 /*yield*/, promises_1.default.readFile(filePath)];
            case 1:
                data = _a.sent();
                logToFile("File read successfully", filePath, "size:", data.length);
                return [2 /*return*/, new Uint8Array(data)];
            case 2:
                error_4 = _a.sent();
                logToFile("Error reading file", filePath, error_4);
                throw error_4;
            case 3: return [2 /*return*/];
        }
    });
}); });
process.on("uncaughtException", function (err) {
    logToFile("Uncaught Exception", err);
});
process.on("unhandledRejection", function (reason, promise) {
    logToFile("Unhandled Rejection", reason);
});
