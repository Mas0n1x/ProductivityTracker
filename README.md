# ☕ Kaffee Produktivitäts-Tracker

Ein visueller Produktivitäts-Tracker mit Kaffeetassen-Timer und Kanban-Board.

![Dark Mode](https://img.shields.io/badge/Theme-Dark%20Mode-1a1a2e)
![Electron](https://img.shields.io/badge/Electron-39.2.7-47848F)
![Platform](https://img.shields.io/badge/Platform-Windows-blue)

## Features

### Kanban-Board (Trello-Style)
- **Backlog** - Sammle neue Aufgaben
- **In Arbeit** - Aktive Aufgabe mit Timer
- **Erledigt** - Abgeschlossene Aufgaben
- Drag & Drop zwischen Spalten
- Task-Bearbeitung mit Modal

### Kaffeetassen-Timer
- Visuelle Darstellung: Tasse leert sich während der Timer läuft
- Dampf-Animation bei aktivem Timer
- Start/Pause/Reset Steuerung
- Sound-Benachrichtigung bei Abschluss

### Task-Management
- Titel, Beschreibung und Zeit pro Aufgabe
- Farbige Labels (Dringend, Medium, Einfach, Feature, Bug)
- Automatisches Speichern im LocalStorage
- Tagesstatistik (erledigte Aufgaben & Gesamtzeit)

## Installation

### Voraussetzungen
- [Node.js](https://nodejs.org/) (LTS Version empfohlen)

### Entwicklung starten
```bash
# Dependencies installieren
npm install

# App starten
npm start
```

### Windows .exe bauen
```bash
npm run build
```
Die fertige .exe findest du im `dist/` Ordner.

## Projektstruktur

```
ProductivityTracker/
├── index.html      # Hauptseite mit Kanban-Board
├── style.css       # Dark Mode Styling
├── script.js       # App-Logik (Timer, Drag&Drop, Tasks)
├── main.js         # Electron Hauptprozess
├── package.json    # Projektconfig & Build-Settings
└── dist/           # Build-Output (.exe)
```

## Verwendung

1. **Aufgabe erstellen**: Im Backlog Titel + Zeit eingeben
2. **Aufgabe starten**: Task nach "In Arbeit" ziehen
3. **Timer starten**: Start-Button klicken
4. **Fertig**: Task wird automatisch nach "Erledigt" verschoben

## Tastenkürzel

- `Enter` - Neue Aufgabe hinzufügen (in Input-Feld)

## Autor

**Mas0n1x**

## Lizenz

MIT License
