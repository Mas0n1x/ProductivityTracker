const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Autostart
    getAutostart: () => ipcRenderer.invoke('get-autostart'),
    setAutostart: (enable) => ipcRenderer.invoke('set-autostart', enable),

    // App Info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Check if running in Electron
    isElectron: true
});
