const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#1a1a2e',
        show: false
    });

    mainWindow.loadFile('index.html');

    // Fenster anzeigen wenn geladen
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Menüleiste ausblenden
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
