# Mas0n1x Produktivitäts-Tracker

Ein moderner, visueller Produktivitäts-Tracker mit Kaffeetassen-Timer, Kanban-Board, Fokus-Modus und Gamification-System.

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
- Realistische Dampf-Animation mit 8 Partikeln
- Start/Pause/Reset Steuerung
- Countdown-Timer für geschätzte Zeit
- Stoppuhr für tatsächliche Arbeitszeit
- **Automatische Kopplung**: Stoppuhr startet automatisch mit dem Timer
- **Manuelle Beendigung**: Aufgabe wird erst bei Stopp der Stoppuhr abgeschlossen

### Fokus-Modus
- Ablenkungsfreier Vollbildmodus für konzentriertes Arbeiten
- Premium-Kaffeetasse mit 3D-Effekten und Glanzreflexionen
- Atmosphärische Dampf-Animation mit 8 Partikeln
- Glass-Morphism Design mit Ambient-Lighting
- Kreisförmiger Fortschrittsring mit Glow-Effekt
- Eigene Timer-Steuerung (Start/Pause/Fertig)
- Synchronisation mit Haupt-Timer
- ESC zum schnellen Beenden

### Projekt-Zeiterfassung
- Eigene Projekte mit Namen und Farben erstellen
- Aufgaben einem Projekt zuweisen
- Automatische Zeiterfassung pro Projekt
- Balkendiagramm zur Visualisierung der Zeitverteilung
- Gesamtzeit pro Projekt einsehen

### Subtasks
- Aufgaben in kleinere Schritte unterteilen
- Subtasks werden erst bei "In Arbeit" sichtbar
- Direkt auf der Task-Card abhaken mit Checkboxen
- Fortschrittsbalken zeigt Subtask-Status
- Erledigte Subtasks werden durchgestrichen

### Task-Management
- Titel, Beschreibung und geschätzte Zeit pro Aufgabe
- 5 Kategorien: Arbeit, Privat, Lernen, Sport, Projekt
- Farbige Labels (Dringend, Medium, Einfach, Feature, Bug)
- Projekt-Zuweisung für Zeiterfassung
- Subtasks für komplexe Aufgaben
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

### Statistiken & Analyse
- Tagesübersicht: Aufgaben, Zeit, XP
- Wochenübersicht mit Durchschnittswerten
- **Produktivitäts-Heatmap** - Zeigt wann du am produktivsten bist (Tag/Stunde)
- **Kategorie-Analyse** - Zeit pro Kategorie in der Woche
- **Zeitschätzungs-Genauigkeit** - Wie gut schätzt du deine Zeiten?
  - Genauigkeits-Prozent
  - Durchschnittliche Abweichung
  - Aufschlüsselung: Schneller / Pünktlich / Langsamer

### Globale Notizen
- Separater Notizen-Bereich unabhängig von Tasks
- Automatisches Speichern beim Tippen
- Export als Text-Datei

### Backup & Export
- Komplettes Backup aller Daten als JSON
- Tasks, Statistiken, Achievements, Notizen
- Import von Backup-Dateien
- Letzter Backup-Zeitstempel

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
3. **Timer starten**: Start-Button klicken (Countdown + Stoppuhr starten automatisch zusammen)
4. **Fokus-Modus**: 🎯 Button für ablenkungsfreies Arbeiten
5. **Projekte**: 📁 Button für Projekt-Zeiterfassung
6. **Subtasks**: Im Task-Modal Subtasks hinzufügen
7. **Fertig**: Stoppuhr stoppen um Aufgabe abzuschließen (tatsächliche Zeit wird erfasst)
8. **XP sammeln**: Für jede erledigte Aufgabe gibt es XP basierend auf der Zeit

## Tastenkürzel

- `Enter` - Neue Aufgabe/Subtask/Projekt hinzufügen
- `Escape` - Modal oder Fokus-Modus schließen

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
