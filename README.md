# Mas0n1x Produktivitäts-Tracker

Ein moderner, visueller Produktivitäts-Tracker mit Kaffeetassen-Timer, Kanban-Board und Gamification-System.

![Dark Mode](https://img.shields.io/badge/Theme-Dark%20Mode-1a1a2e)
![Electron](https://img.shields.io/badge/Electron-39.2.7-47848F)
![Platform](https://img.shields.io/badge/Platform-Windows-blue)

## Features

### Kanban-Board (Trello-Style)
- **Backlog** - Sammle neue Aufgaben mit Titel, Zeit und Kategorie
- **In Arbeit** - Aktive Aufgabe mit Timer-Verknüpfung
- **Erledigt** - Abgeschlossene Aufgaben mit Zeitvergleich
- Drag & Drop zwischen Spalten
- Task-Bearbeitung mit detailliertem Modal

### Kaffeetassen-Timer
- Visuelle Darstellung: Tasse leert sich während der Timer läuft
- Dampf-Animation bei aktivem Timer
- Start/Pause/Reset Steuerung
- Countdown-Timer für geschätzte Zeit
- Stoppuhr für tatsächliche Arbeitszeit

### Task-Management
- Titel, Beschreibung und geschätzte Zeit pro Aufgabe
- 5 Kategorien: Arbeit, Privat, Lernen, Sport, Projekt
- Farbige Labels (Dringend, Medium, Einfach, Feature, Bug)
- Notizen-Feld für zusätzliche Informationen
- Automatisches Speichern im LocalStorage
- Tagesstatistik (erledigte Aufgaben & Gesamtzeit)

### Gamification-System
- **Level-System** mit XP-Fortschritt
- **Tages-Streak** für aufeinanderfolgende produktive Tage
- **16 Achievements** zum Freischalten:
  - Erste Schritte, Fleißig, Produktiv, Meister (Aufgaben-basiert)
  - Speed Demon, Time Lord (Zeit-basiert)
  - Streak-Achievements (3, 7, 14, 30 Tage)
  - Kategorie-Spezialist (alle Kategorien nutzen)
  - Frühaufsteher, Nachteule (Zeitfenster-basiert)
  - und mehr!
- **Tagesziel** mit anpassbarem Minutenziel
- Level-Up und Achievement-Benachrichtigungen

### Statistiken
- Tagesübersicht: Aufgaben, Zeit, XP
- Wochenübersicht
- Zeit-Vergleich: Geschätzte vs. tatsächliche Zeit
- Kategorie-Verteilung

### Responsive Design
- Optimiert für verschiedene Bildschirmgrößen
- Funktioniert auf Desktop (1280px+) bis Mobile (400px)
- Adaptive Layouts für Tablet und kleine Fenster
- Scrollbare Kanban-Spalten bei wenig Platz

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
├── index.html      # Hauptseite mit Kanban-Board & UI
├── style.css       # Dark Mode Styling (Glass-Morphism Design)
├── script.js       # App-Logik (Timer, Drag&Drop, Gamification)
├── main.js         # Electron Hauptprozess
├── logo.png        # App-Logo
├── package.json    # Projektconfig & Build-Settings
└── dist/           # Build-Output (.exe)
```

## Verwendung

1. **Aufgabe erstellen**: Im Backlog Titel + Zeit + Kategorie eingeben
2. **Aufgabe starten**: Task nach "In Arbeit" ziehen
3. **Timer starten**: Start-Button klicken (Countdown + Stoppuhr)
4. **Fertig**: Task wird automatisch nach "Erledigt" verschoben
5. **XP sammeln**: Für jede erledigte Aufgabe gibt es XP basierend auf der Zeit

## Tastenkürzel

- `Enter` - Neue Aufgabe hinzufügen (im Input-Feld)
- `Escape` - Modal schließen

## Technologien

- **Electron** - Desktop-App Framework
- **Vanilla JavaScript** - Keine zusätzlichen Frameworks
- **CSS3** - Glass-Morphism Design mit Animationen
- **LocalStorage** - Persistente Datenspeicherung

## Design-Features

- Dunkles Theme mit Grün-Akzenten
- Glass-Morphism Effekte (Backdrop-Filter)
- Smooth Animationen und Übergänge
- 3D Kaffeetassen-Visualisierung
- Responsive Grid und Flexbox Layouts

## Autor

**Mas0n1x**

## Lizenz

MIT License
