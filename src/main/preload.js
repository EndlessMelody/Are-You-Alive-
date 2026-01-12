const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getProfile: () => ipcRenderer.invoke("get-profile"),
  saveProfile: (profile) => ipcRenderer.invoke("save-profile", profile),
  checkIn: (data) => ipcRenderer.invoke("check-in", data),
  getStats: () => ipcRenderer.invoke("get-stats"),
  getHistory: () => ipcRenderer.invoke("get-history"),
});
