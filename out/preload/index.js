"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("__ELECTRON_API__", {
  windowMinimize: () => electron.ipcRenderer.invoke("window:minimize"),
  windowMaximize: () => electron.ipcRenderer.invoke("window:maximize"),
  windowClose: () => electron.ipcRenderer.invoke("window:close"),
  getAppVersion: () => electron.ipcRenderer.invoke("app:version"),
  chatStream: (userInput) => electron.ipcRenderer.invoke("chat:stream", userInput),
  chatNonStream: (userInput) => electron.ipcRenderer.invoke("chat:nonStream", userInput),
  onSSEEvent: (callback) => {
    electron.ipcRenderer.on("sse:event", (_event, data) => callback(data));
  },
  removeSSEListener: () => {
    electron.ipcRenderer.removeAllListeners("sse:event");
  },
  stopGeneration: () => electron.ipcRenderer.invoke("chat:stop"),
  onBeforeClose: (callback) => {
    electron.ipcRenderer.on("window:before-close", () => callback());
  },
  confirmClose: () => electron.ipcRenderer.send("close-confirmed")
});
