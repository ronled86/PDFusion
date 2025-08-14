"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    openPdf: function () { return electron_1.ipcRenderer.invoke("dialog:openPdf"); },
    savePdf: function (name, data) { return electron_1.ipcRenderer.invoke("dialog:savePdf", name, data); },
    showInFolder: function (p) { return electron_1.ipcRenderer.invoke("shell:showItemInFolder", p); },
    printPdf: function (data, filename) { return electron_1.ipcRenderer.invoke("print:pdf", data, filename); },
    ipcRenderer: {
        on: function (channel, func) { return electron_1.ipcRenderer.on(channel, function (_event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return func.apply(void 0, args);
        }); },
        removeListener: function (channel, func) { return electron_1.ipcRenderer.removeListener(channel, func); },
        removeAllListeners: function (channel) { return electron_1.ipcRenderer.removeAllListeners(channel); }
    },
    readFileAsUint8Array: function (filePath) { return electron_1.ipcRenderer.invoke("fs:readFileAsUint8Array", filePath); }
});
