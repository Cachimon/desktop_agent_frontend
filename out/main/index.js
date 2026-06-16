"use strict";
const electron = require("electron");
const path = require("path");
let mainWindow = null;
function isDev() {
  return !electron.app.isPackaged;
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow.webContents.send("window:before-close");
  });
  if (isDev() && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
}
function getMainWindow() {
  return mainWindow;
}
function destroyWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners("close");
    mainWindow.close();
    mainWindow = null;
  }
}
function setupAppLifecycle() {
  electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
const API_BASE_URL = "http://localhost:8000";
const API_PATH_CHAT_STREAM = "/chat/stream";
const API_PATH_CHAT_NON_STREAM = "/chat/";
let currentRequest = null;
let timeoutHandle = null;
function startStreamRequest(mainWindow2, userInput) {
  const url = `${API_BASE_URL}${API_PATH_CHAT_STREAM}`;
  const request = electron.net.request({
    method: "POST",
    url
  });
  request.setHeader("Content-Type", "application/json");
  currentRequest = request;
  let buffer = "";
  request.on("response", (response) => {
    if (response.statusCode !== 200) {
      mainWindow2.webContents.send("sse:event", {
        type: "error",
        data: `HTTP ${response.statusCode}`
      });
      cleanup();
      return;
    }
    resetTimeout(mainWindow2);
    response.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data:")) {
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr) {
            try {
              const event = JSON.parse(jsonStr);
              mainWindow2.webContents.send("sse:event", event);
              if (event.type === "content") {
                resetTimeout(mainWindow2);
              }
            } catch {
            }
          }
        }
      }
    });
    response.on("end", () => {
      clearTimeoutHandle();
      mainWindow2.webContents.send("sse:event", { type: "end", data: "" });
      cleanup();
    });
    response.on("error", (error) => {
      clearTimeoutHandle();
      mainWindow2.webContents.send("sse:event", {
        type: "error",
        data: error.message
      });
      cleanup();
    });
  });
  request.on("error", (error) => {
    clearTimeoutHandle();
    mainWindow2.webContents.send("sse:event", {
      type: "error",
      data: error.message
    });
    cleanup();
  });
  request.write(JSON.stringify({ user_input: userInput }));
  request.end();
}
function startNonStreamRequest(userInput) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${API_PATH_CHAT_NON_STREAM}`;
    const request = electron.net.request({
      method: "POST",
      url
    });
    request.setHeader("Content-Type", "application/json");
    request.on("response", (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk.toString();
      });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data || "");
        } catch {
          reject(new Error("Invalid response format"));
        }
      });
      response.on("error", (error) => reject(error));
    });
    request.on("error", (error) => reject(error));
    request.write(JSON.stringify({ user_input: userInput }));
    request.end();
  });
}
function stopCurrentRequest() {
  if (currentRequest) {
    currentRequest.abort();
    cleanup();
  }
}
function resetTimeout(mainWindow2) {
  clearTimeoutHandle();
  timeoutHandle = setTimeout(() => {
    mainWindow2.webContents.send("sse:event", {
      type: "error",
      data: "响应超时"
    });
    stopCurrentRequest();
  }, 6e4);
}
function clearTimeoutHandle() {
  if (timeoutHandle) {
    clearTimeout(timeoutHandle);
    timeoutHandle = null;
  }
}
function cleanup() {
  currentRequest = null;
  clearTimeoutHandle();
}
function registerIpcHandlers() {
  electron.ipcMain.handle("window:minimize", () => {
    const win = electron.BrowserWindow.getFocusedWindow();
    win?.minimize();
  });
  electron.ipcMain.handle("window:maximize", () => {
    const win = electron.BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  electron.ipcMain.handle("window:close", () => {
    const win = electron.BrowserWindow.getFocusedWindow();
    if (win) {
      win.removeAllListeners("close");
      win.close();
    }
  });
  electron.ipcMain.handle("app:version", () => {
    return electron.app.getVersion();
  });
  electron.ipcMain.handle("chat:stream", (_event, userInput) => {
    const mainWindow2 = getMainWindow();
    if (mainWindow2 && !mainWindow2.isDestroyed()) {
      startStreamRequest(mainWindow2, userInput);
    }
  });
  electron.ipcMain.handle("chat:nonStream", async (_event, userInput) => {
    return await startNonStreamRequest(userInput);
  });
  electron.ipcMain.handle("chat:stop", () => {
    stopCurrentRequest();
  });
  electron.ipcMain.on("close-confirmed", () => {
    destroyWindow();
  });
}
function initApp() {
  electron.app.whenReady().then(() => {
    registerIpcHandlers();
    createWindow();
    setupAppLifecycle();
  });
}
initApp();
