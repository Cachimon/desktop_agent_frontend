"use strict";
const electron = require("electron");
const IPC_CHANNEL_WINDOW_MINIMIZE = "window:minimize";
const IPC_CHANNEL_WINDOW_MAXIMIZE = "window:maximize";
const IPC_CHANNEL_WINDOW_CLOSE = "window:close";
const IPC_CHANNEL_APP_VERSION = "app:version";
const IPC_CHANNEL_CHAT_STREAM = "chat:stream";
const IPC_CHANNEL_CHAT_NON_STREAM = "chat:nonStream";
const IPC_CHANNEL_CHAT_STOP = "chat:stop";
const IPC_CHANNEL_SSE_EVENT = "sse:event";
const IPC_CHANNEL_BEFORE_CLOSE = "window:before-close";
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
electron.contextBridge.exposeInMainWorld("__ELECTRON_API__", {
  windowMinimize: () => electron.ipcRenderer.invoke(IPC_CHANNEL_WINDOW_MINIMIZE),
  windowMaximize: () => electron.ipcRenderer.invoke(IPC_CHANNEL_WINDOW_MAXIMIZE),
  windowClose: () => electron.ipcRenderer.invoke(IPC_CHANNEL_WINDOW_CLOSE),
  getAppVersion: () => electron.ipcRenderer.invoke(IPC_CHANNEL_APP_VERSION),
  chatStream: (params) => electron.ipcRenderer.invoke(IPC_CHANNEL_CHAT_STREAM, params),
  chatNonStream: (params) => electron.ipcRenderer.invoke(IPC_CHANNEL_CHAT_NON_STREAM, params),
  onSSEEvent: (callback) => {
    electron.ipcRenderer.on(IPC_CHANNEL_SSE_EVENT, (_event, data) => callback(data));
  },
  removeSSEListener: () => {
    electron.ipcRenderer.removeAllListeners(IPC_CHANNEL_SSE_EVENT);
  },
  stopGeneration: () => electron.ipcRenderer.invoke(IPC_CHANNEL_CHAT_STOP),
  onBeforeClose: (callback) => {
    electron.ipcRenderer.on(IPC_CHANNEL_BEFORE_CLOSE, () => callback());
  },
  confirmClose: () => electron.ipcRenderer.send("close-confirmed"),
  hitlConfirm: (params) => electron.ipcRenderer.invoke(IPC_CHANNEL_HITL_CONFIRM, params),
  authSendCode: (email) => electron.ipcRenderer.invoke(IPC_CHANNEL_AUTH_SEND_CODE, email),
  authLogin: (params) => electron.ipcRenderer.invoke(IPC_CHANNEL_AUTH_LOGIN, params),
  authRefresh: () => electron.ipcRenderer.invoke(IPC_CHANNEL_AUTH_REFRESH),
  authLogout: () => electron.ipcRenderer.invoke(IPC_CHANNEL_AUTH_LOGOUT),
  authMe: () => electron.ipcRenderer.invoke(IPC_CHANNEL_AUTH_ME),
  skillList: () => electron.ipcRenderer.invoke(IPC_CHANNEL_SKILL_LIST),
  skillDetail: (name) => electron.ipcRenderer.invoke(IPC_CHANNEL_SKILL_DETAIL, name),
  workspaceList: () => electron.ipcRenderer.invoke(IPC_CHANNEL_WORKSPACE_LIST),
  workspaceAdd: (params) => electron.ipcRenderer.invoke(IPC_CHANNEL_WORKSPACE_ADD, params),
  workspaceRemove: (path) => electron.ipcRenderer.invoke(IPC_CHANNEL_WORKSPACE_REMOVE, path),
  healthCheck: () => electron.ipcRenderer.invoke(IPC_CHANNEL_HEALTH_CHECK)
});
