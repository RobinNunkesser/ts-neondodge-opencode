# Neon Dodge — OpenCode Implementation Showcase

> **Agentic Game Development Benchmark** zur Vorlesung *Interaktive Grafikanwendungen (IGA)*  
> Prof. Dr. Robin Nunkesser – Hochschule Hamm-Lippstadt (HSHL)

Dieses Repository dient als isolierte Experimentierumgebung zur **Spezifikations-getriebenen Entwicklung mit dem Open-Source-Agenten [OpenCode](https://opencode.ai)**.

Im Unterschied zur Referenzlösung ([`ts-neondodge-babylonjs`](https://github.com/RobinNunkesser/ts-neondodge-babylonjs)) enthält dieses Repository im Ausgangszustand **ausschließlich die Spezifikationen in `docs/gdd/`**. Sämtlicher Code, Scaffolding und Tests werden schrittweise durch OpenCode auf Basis der Markdown-Dateien generiert.

---

## 📋 Das Spezifikations-Fundament (`docs/gdd/`)

1. [**01_concept_and_loop.md**](docs/gdd/01_concept_and_loop.md): High Concept, 5–10s Core Loop, Win/Loss & Scoring
2. [**02_input_and_controls.md**](docs/gdd/02_input_and_controls.md): Desktop- & Touch-Steuerung, Kinematik & Optical Flow
3. [**03_architecture.md**](docs/gdd/03_architecture.md): Softwarearchitektur (Headless Core `src/core/` vs. Babylon.js Rendering `src/render/`)
4. [**04_state_machine.md**](docs/gdd/04_state_machine.md): Formales Zustandsmodell (`MENU`, `PLAYING`, `PAUSED`, `GAME_OVER`)
5. [**05_parameters.md**](docs/gdd/05_parameters.md): Parameter-Katalog für `src/config.ts`

---

## 🚀 Durchführung mit OpenCode

### 1. OpenCode im Projektordner starten
```bash
# Im Terminal in dieses Verzeichnis wechseln
cd artifacts/consumers/education/ts-neondodge-opencode

# OpenCode TUI starten
opencode
```

### 2. Modell auswählen
Innerhalb von OpenCode:
- `/models` eingeben, um verfügbare Modelle anzuzeigen.
- Empfohlen für kostenlosen Test: `zen-default` oder ein angebundenes `gemini-2.5-flash` / `deepseek`-Modell.

### 3. Phasenweises Prompting (Human-in-the-Loop)

#### Phase 1: Scaffolding & Core Loop
> *"Lies `docs/gdd/01_concept_and_loop.md` und `docs/gdd/03_architecture.md`. Initialisiere das Projekt mit Vite, TypeScript und Babylon.js (`@babylonjs/core`). Implementiere den minimal spielbaren Core Loop gemäß der Modulstruktur. Nach erfolgreichem Test im Browser erstelle einen Git Commit."*

#### Phase 2: Parameter-Tuning
> *"Lies `docs/gdd/05_parameters.md`. Extrahiere alle Parameter vollständig nach `src/config.ts`. Entferne alle Magic Numbers aus den Render- und Logikmodulen."*

#### Phase 3: State Machine & Headless Tests
> *"Lies `docs/gdd/04_state_machine.md`. Implementiere die State Machine in `src/core/state.ts` und erstelle automatisierte Unit-Tests mit Vitest in `test/`. Binde die Overlays (Menu, Pause, GameOver) in `index.html` und `src/main.ts` ein."*

#### Phase 4: Polish & Game Feel
> *"Lies `docs/gdd/02_input_and_controls.md` und `docs/gdd/05_parameters.md`. Implementiere Banking Tilt bei Lenkbewegung, Screen Shake und Partikelexplosion bei Kollision sowie Touch-Drag-Steuerung für Mobilgeräte."*

---

## 📜 Lizenz
MIT License – Robin Nunkesser
