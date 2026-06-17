"use strict";
const electron = require("electron");
const path = require("path");
const API_BASE_URL = "http://localhost:8000";
const API_V1_PREFIX = "/api/v1";
const API_PATH_CHAT_STREAM = `${API_V1_PREFIX}/chat/stream`;
const API_PATH_CHAT_NON_STREAM = `${API_V1_PREFIX}/chat/`;
const API_PATH_HITL_CONFIRM = `${API_V1_PREFIX}/chat/hitl-confirm`;
const API_PATH_SKILLS = `${API_V1_PREFIX}/skills/`;
const API_PATH_SKILL_DETAIL = `${API_V1_PREFIX}/skills/`;
const API_PATH_WORKSPACE = `${API_V1_PREFIX}/settings/workspace`;
const API_PATH_HEALTH = `${API_V1_PREFIX}/health/`;
const API_PATH_AUTH_SEND_CODE = `${API_V1_PREFIX}/auth/send-code`;
const API_PATH_AUTH_LOGIN = `${API_V1_PREFIX}/auth/login`;
const API_PATH_AUTH_REFRESH = `${API_V1_PREFIX}/auth/refresh`;
const API_PATH_AUTH_LOGOUT = `${API_V1_PREFIX}/auth/logout`;
const API_PATH_AUTH_ME = `${API_V1_PREFIX}/auth/me`;
const IPC_CHANNEL_WINDOW_MINIMIZE = "window:minimize";
const IPC_CHANNEL_WINDOW_MAXIMIZE = "window:maximize";
const IPC_CHANNEL_WINDOW_CLOSE = "window:close";
const IPC_CHANNEL_APP_VERSION = "app:version";
const IPC_CHANNEL_CHAT_STREAM = "chat:stream";
const IPC_CHANNEL_CHAT_NON_STREAM = "chat:nonStream";
const IPC_CHANNEL_CHAT_STOP = "chat:stop";
const IPC_CHANNEL_SSE_EVENT = "sse:event";
const IPC_CHANNEL_HITL_CONFIRM = "hitl:confirm";
const IPC_CHANNEL_AUTH_SEND_CODE = "auth:sendCode";
const IPC_CHANNEL_AUTH_LOGIN = "auth:login";
const IPC_CHANNEL_AUTH_REFRESH = "auth:refresh";
const IPC_CHANNEL_AUTH_LOGOUT = "auth:logout";
const IPC_CHANNEL_AUTH_ME = "auth:me";
const IPC_CHANNEL_SKILL_LIST = "skill:list";
const IPC_CHANNEL_SKILL_DETAIL = "skill:detail";
const IPC_CHANNEL_WORKSPACE_LIST = "workspace:list";
const IPC_CHANNEL_WORKSPACE_ADD = "workspace:add";
const IPC_CHANNEL_WORKSPACE_REMOVE = "workspace:remove";
const IPC_CHANNEL_HEALTH_CHECK = "health:check";
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
let currentRequest = null;
let timeoutHandle = null;
let accessToken = null;
function setAccessToken(token) {
  accessToken = token;
}
function startStreamRequest(mainWindow2, params) {
  const url = `${API_BASE_URL}${API_PATH_CHAT_STREAM}`;
  const request = electron.net.request({
    method: "POST",
    url
  });
  request.setHeader("Content-Type", "application/json");
  if (accessToken) {
    request.setHeader("Authorization", `Bearer ${accessToken}`);
  }
  currentRequest = request;
  let buffer = "";
  let currentEventType = "";
  request.on("response", (response) => {
    if (response.statusCode === 401) {
      handleTokenRefresh(mainWindow2, params);
      cleanup();
      return;
    }
    if (response.statusCode !== 200) {
      mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: "error",
        data: { message: `HTTP ${response.statusCode}` }
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
        if (trimmed.startsWith("event:")) {
          currentEventType = trimmed.slice(6).trim();
        } else if (trimmed.startsWith("data:")) {
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr);
              const v3Event = {
                type: currentEventType === "end" ? "end" : parsed.type || currentEventType,
                ns: parsed.ns,
                data: parsed.data ?? parsed,
                message_id: parsed.message_id
              };
              mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, v3Event);
              if (v3Event.type === "ai" || v3Event.type === "tool" || v3Event.type === "human") {
                resetTimeout(mainWindow2);
              }
            } catch {
            }
          }
          currentEventType = "";
        }
      }
    });
    response.on("end", () => {
      clearTimeoutHandle();
      mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: "end",
        data: {}
      });
      cleanup();
    });
    response.on("error", (error) => {
      clearTimeoutHandle();
      mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: "error",
        data: { message: error.message }
      });
      cleanup();
    });
  });
  request.on("error", (error) => {
    clearTimeoutHandle();
    mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
      type: "error",
      data: { message: error.message }
    });
    cleanup();
  });
  request.write(JSON.stringify(params));
  request.end();
}
async function handleTokenRefresh(mainWindow2, originalParams) {
  try {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      startStreamRequest(mainWindow2, originalParams);
    } else {
      mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
        type: "error",
        data: { message: "TOKEN_EXPIRED" }
      });
    }
  } catch {
    mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
      type: "error",
      data: { message: "TOKEN_EXPIRED" }
    });
  }
}
function startNonStreamRequest(params) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${API_PATH_CHAT_NON_STREAM}`;
    const request = electron.net.request({
      method: "POST",
      url
    });
    request.setHeader("Content-Type", "application/json");
    if (accessToken) {
      request.setHeader("Authorization", `Bearer ${accessToken}`);
    }
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
    request.write(JSON.stringify(params));
    request.end();
  });
}
function stopCurrentRequest() {
  if (currentRequest) {
    currentRequest.abort();
    cleanup();
  }
}
function apiRequest(method, path2, body) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${path2}`;
    const request = electron.net.request({
      method,
      url
    });
    request.setHeader("Content-Type", "application/json");
    request.setHeader("X-Requested-With", "XMLHttpRequest");
    if (accessToken) {
      request.setHeader("Authorization", `Bearer ${accessToken}`);
    }
    request.on("response", (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk.toString();
      });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (response.statusCode && response.statusCode >= 400) {
            const error = new Error(parsed.message || parsed.detail || `HTTP ${response.statusCode}`);
            error.statusCode = response.statusCode;
            error.errorCode = parsed.error_code;
            reject(error);
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      });
      response.on("error", (error) => reject(error));
    });
    request.on("error", (error) => reject(error));
    if (body) {
      request.write(JSON.stringify(body));
    }
    request.end();
  });
}
async function refreshAccessToken() {
  try {
    const result = await apiRequest(
      "POST",
      API_PATH_AUTH_REFRESH
    );
    accessToken = result.access_token;
    return true;
  } catch {
    accessToken = null;
    return false;
  }
}
function resetTimeout(mainWindow2) {
  clearTimeoutHandle();
  timeoutHandle = setTimeout(() => {
    mainWindow2.webContents.send(IPC_CHANNEL_SSE_EVENT, {
      type: "error",
      data: { message: "响应超时" }
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
  electron.ipcMain.handle(IPC_CHANNEL_WINDOW_MINIMIZE, () => {
    const win = electron.BrowserWindow.getFocusedWindow();
    win?.minimize();
  });
  electron.ipcMain.handle(IPC_CHANNEL_WINDOW_MAXIMIZE, () => {
    const win = electron.BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  electron.ipcMain.handle(IPC_CHANNEL_WINDOW_CLOSE, () => {
    const win = electron.BrowserWindow.getFocusedWindow();
    if (win) {
      win.removeAllListeners("close");
      win.close();
    }
  });
  electron.ipcMain.handle(IPC_CHANNEL_APP_VERSION, () => {
    return electron.app.getVersion();
  });
  electron.ipcMain.handle(IPC_CHANNEL_CHAT_STREAM, (_event, params) => {
    const mainWindow2 = getMainWindow();
    if (mainWindow2 && !mainWindow2.isDestroyed()) {
      startStreamRequest(mainWindow2, params);
    }
  });
  electron.ipcMain.handle(IPC_CHANNEL_CHAT_NON_STREAM, async (_event, params) => {
    return await startNonStreamRequest(params);
  });
  electron.ipcMain.handle(IPC_CHANNEL_CHAT_STOP, () => {
    stopCurrentRequest();
  });
  electron.ipcMain.handle(IPC_CHANNEL_HITL_CONFIRM, async (_event, params) => {
    return await apiRequest("POST", API_PATH_HITL_CONFIRM, params);
  });
  electron.ipcMain.handle(IPC_CHANNEL_AUTH_SEND_CODE, async (_event, email) => {
    return await apiRequest("POST", API_PATH_AUTH_SEND_CODE, { email });
  });
  electron.ipcMain.handle(IPC_CHANNEL_AUTH_LOGIN, async (_event, params) => {
    const result = await apiRequest("POST", API_PATH_AUTH_LOGIN, params);
    setAccessToken(result.access_token);
    return result;
  });
  electron.ipcMain.handle(IPC_CHANNEL_AUTH_REFRESH, async () => {
    const success = await refreshAccessToken();
    if (!success) {
      throw new Error("TOKEN_EXPIRED");
    }
    return { success: true };
  });
  electron.ipcMain.handle(IPC_CHANNEL_AUTH_LOGOUT, async () => {
    try {
      await apiRequest("POST", API_PATH_AUTH_LOGOUT);
    } finally {
      setAccessToken(null);
    }
  });
  electron.ipcMain.handle(IPC_CHANNEL_AUTH_ME, async () => {
    return await apiRequest("GET", API_PATH_AUTH_ME);
  });
  electron.ipcMain.handle(IPC_CHANNEL_SKILL_LIST, async () => {
    return await apiRequest("GET", API_PATH_SKILLS);
  });
  electron.ipcMain.handle(IPC_CHANNEL_SKILL_DETAIL, async (_event, name) => {
    return await apiRequest("GET", `${API_PATH_SKILL_DETAIL}${encodeURIComponent(name)}`);
  });
  electron.ipcMain.handle(IPC_CHANNEL_WORKSPACE_LIST, async () => {
    return await apiRequest("GET", API_PATH_WORKSPACE);
  });
  electron.ipcMain.handle(IPC_CHANNEL_WORKSPACE_ADD, async (_event, params) => {
    return await apiRequest("POST", API_PATH_WORKSPACE, { action: "add", ...params });
  });
  electron.ipcMain.handle(IPC_CHANNEL_WORKSPACE_REMOVE, async (_event, path2) => {
    return await apiRequest("POST", API_PATH_WORKSPACE, { action: "remove", path: path2 });
  });
  electron.ipcMain.handle(IPC_CHANNEL_HEALTH_CHECK, async () => {
    try {
      const result = await apiRequest("GET", API_PATH_HEALTH);
      return result;
    } catch {
      return null;
    }
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
  process.on("uncaughtException", (error) => {
    console.error("[Main] Uncaught Exception:", error);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[Main] Unhandled Rejection:", reason);
  });
}
initApp();
