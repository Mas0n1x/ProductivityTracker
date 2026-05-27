const electron = require('electron');
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = electron;
const path = require('path');
const http = require('http');
const url = require('url');

let mainWindow;
let tray = null;
let apiServer = null;

function createWindow() {
    const startMinimized = process.argv.includes('--autostart') || process.argv.includes('--hidden');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            backgroundThrottling: false  // Timer läuft auch minimiert weiter
        },
        backgroundColor: '#0a0f0a',
        show: false,
        icon: path.join(__dirname, 'logo.png')
    });

    mainWindow.loadFile('index.html');

    // Fenster anzeigen wenn geladen (außer bei Autostart → ins Tray)
    mainWindow.once('ready-to-show', () => {
        if (!startMinimized) {
            mainWindow.show();
        }
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
    // Windows: für Notifications, Taskleiste, Autostart-Identifikation
    if (process.platform === 'win32' && typeof app.setAppUserModelId === 'function') {
        app.setAppUserModelId('com.mas0n1x.produktivitaets-tracker');
    }
    createWindow();
    createTray();
    startJarvisApi();
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
    if (apiServer) {
        try { apiServer.close(); } catch (_) { /* noop */ }
    }
});

// ========================================
// AUTOSTART FUNKTIONALITÄT
// ========================================

// Bei portable EXEs (electron-builder) zeigt app.getPath('exe') auf eine
// temporär entpackte Datei. PORTABLE_EXECUTABLE_FILE ist der echte Pfad
// zur portablen .exe — den müssen wir registrieren, sonst funktioniert
// der Autostart-Eintrag nach dem nächsten Start nicht mehr.
function getAutostartExePath() {
    return process.env.PORTABLE_EXECUTABLE_FILE || app.getPath('exe');
}

// Autostart Status abfragen
ipcMain.handle('get-autostart', () => {
    return app.getLoginItemSettings({ path: getAutostartExePath() }).openAtLogin;
});

// Autostart setzen
ipcMain.handle('set-autostart', (event, enable) => {
    const exePath = getAutostartExePath();
    app.setLoginItemSettings({
        openAtLogin: enable,
        path: exePath,
        args: ['--autostart']
    });
    return app.getLoginItemSettings({ path: exePath }).openAtLogin;
});

// App-Version abfragen
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// ========================================
// JARVIS HTTP API (http://127.0.0.1:7777)
// ========================================
// Bridge zum Renderer: der hält die Daten in localStorage, pusht bei
// jedem Save einen Snapshot hierher. Mutationen schicken wir zurück
// in den Renderer und warten auf das Ergebnis.

const JARVIS_PORT = 7777;
const MUTATION_TIMEOUT_MS = 5000;

let cachedSnapshot = {
    tasks: [],
    notes: [],
    stats: {
        xp: 0,
        level: 1,
        total_xp: 0,
        streak: 0,
        today_minutes: 0,
        completed_today: 0,
        daily_goal: 120,
        achievements: []
    },
    updatedAt: null
};

const pendingMutations = new Map();
let mutationCounter = 0;

ipcMain.on('tracker-snapshot', (event, snapshot) => {
    if (snapshot && typeof snapshot === 'object') {
        cachedSnapshot = { ...cachedSnapshot, ...snapshot, updatedAt: new Date().toISOString() };
    }
});

ipcMain.on('tracker-mutation-result', (event, payload) => {
    if (!payload || typeof payload.id !== 'number') return;
    const pending = pendingMutations.get(payload.id);
    if (!pending) return;
    pendingMutations.delete(payload.id);
    clearTimeout(pending.timer);
    if (payload.error) {
        pending.reject(new Error(payload.error));
    } else {
        pending.resolve(payload.result);
    }
});

function requestMutation(type, payload) {
    return new Promise((resolve, reject) => {
        if (!mainWindow || mainWindow.isDestroyed() || !mainWindow.webContents) {
            reject(new Error('tracker window not available'));
            return;
        }
        const id = ++mutationCounter;
        const timer = setTimeout(() => {
            if (pendingMutations.has(id)) {
                pendingMutations.delete(id);
                reject(new Error('tracker did not respond in time'));
            }
        }, MUTATION_TIMEOUT_MS);
        pendingMutations.set(id, { resolve, reject, timer });
        mainWindow.webContents.send('tracker-mutation', { id, type, payload });
    });
}

function sendJson(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1_000_000) {
                reject(new Error('payload too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(new Error('invalid JSON body')); }
        });
        req.on('error', reject);
    });
}

function filterTasks(tasks, status) {
    if (!Array.isArray(tasks)) return [];
    if (status === 'all' || !status) {
        if (status === undefined) return tasks.filter(t => t.status !== 'done');
        return tasks;
    }
    if (status === 'open') return tasks.filter(t => t.status !== 'done');
    if (status === 'done') return tasks.filter(t => t.status === 'done');
    return tasks.filter(t => t.status === status);
}

async function handleApiRequest(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname || '';

    // GET /api/state — voller Snapshot
    if (req.method === 'GET' && pathname === '/api/state') {
        sendJson(res, 200, {
            tasks: filterTasks(cachedSnapshot.tasks, 'open'),
            notes: cachedSnapshot.notes,
            stats: cachedSnapshot.stats,
            updatedAt: cachedSnapshot.updatedAt
        });
        return;
    }

    if (req.method === 'GET' && pathname === '/api/tasks') {
        const status = parsed.query.status || 'open';
        sendJson(res, 200, filterTasks(cachedSnapshot.tasks, status));
        return;
    }

    if (req.method === 'GET' && pathname === '/api/notes') {
        sendJson(res, 200, cachedSnapshot.notes || []);
        return;
    }

    if (req.method === 'GET' && pathname === '/api/stats') {
        sendJson(res, 200, cachedSnapshot.stats || {});
        return;
    }

    if (req.method === 'POST' && pathname === '/api/tasks') {
        try {
            const body = await readBody(req);
            if (!body.title || typeof body.title !== 'string') {
                sendJson(res, 400, { ok: false, error: 'title is required' });
                return;
            }
            const result = await requestMutation('add-task', {
                title: body.title,
                notes: body.notes || '',
                category: body.category || ''
            });
            sendJson(res, 200, { ok: true, ...result });
        } catch (e) {
            sendJson(res, 500, { ok: false, error: e.message });
        }
        return;
    }

    const completeMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);
    if (req.method === 'POST' && completeMatch) {
        try {
            const result = await requestMutation('complete-task', { id: completeMatch[1] });
            sendJson(res, 200, { ok: true, ...result });
        } catch (e) {
            sendJson(res, 500, { ok: false, error: e.message });
        }
        return;
    }

    sendJson(res, 404, { error: 'not found', path: pathname });
}

function startJarvisApi() {
    apiServer = http.createServer((req, res) => {
        handleApiRequest(req, res).catch(err => {
            try { sendJson(res, 500, { error: err.message }); } catch (_) { /* noop */ }
        });
    });
    apiServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`[jarvis-api] Port ${JARVIS_PORT} ist belegt — API nicht gestartet.`);
        } else {
            console.error('[jarvis-api]', err);
        }
    });
    apiServer.listen(JARVIS_PORT, '127.0.0.1', () => {
        console.log(`[jarvis-api] lauscht auf http://127.0.0.1:${JARVIS_PORT}`);
    });
}
