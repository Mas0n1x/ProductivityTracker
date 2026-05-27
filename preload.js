const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Autostart
    getAutostart: () => ipcRenderer.invoke('get-autostart'),
    setAutostart: (enable) => ipcRenderer.invoke('set-autostart', enable),

    // App Info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Jarvis-Bridge: aktuellen Datenstand an den Main-Prozess pushen
    pushSnapshot: (snapshot) => ipcRenderer.send('tracker-snapshot', snapshot),

    // Mutationen, die der Main-Prozess (HTTP-API) ausführen lassen will
    onMutation: (handler) => {
        ipcRenderer.removeAllListeners('tracker-mutation');
        ipcRenderer.on('tracker-mutation', (event, data) => handler(data));
    },
    sendMutationResult: (id, result, error) =>
        ipcRenderer.send('tracker-mutation-result', { id, result, error }),

    // Check if running in Electron
    isElectron: true
});
