const electron = require('electron');
const { app, BrowserWindow, Tray, Menu, nativeImage } = electron;
const path = require('path');

let mainWindow;
let tray = null;

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
        backgroundColor: '#0a0f0a',
        show: false,
        icon: path.join(__dirname, 'logo.png')
    });

    mainWindow.loadFile('index.html');

    // Fenster anzeigen wenn geladen
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Menüleiste ausblenden
    mainWindow.setMenuBarVisibility(false);

    // Minimieren zum System Tray statt schließen
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'logo.png');
    const trayIcon = nativeImage.createFromPath(iconPath);
    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Öffnen',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Beenden',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Mas0n1x Produktivitäts-Tracker');
    tray.setContextMenu(contextMenu);

    // Doppelklick öffnet das Fenster
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

app.on('ready', () => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    // Nicht beenden wenn alle Fenster geschlossen
    // App läuft im System Tray weiter
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

// Vor dem Beenden aufräumen
app.on('before-quit', () => {
    app.isQuitting = true;
});
