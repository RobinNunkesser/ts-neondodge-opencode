# 03 - Software-Architektur & Modulstruktur

## Softwaretechnik-Leitbild: Headless Logic vs. Rendering

Um saubere Softwaretechnik und Testbarkeit zu gewährleisten, gilt für dieses Projekt das architektonische Prinzip der **strikten Trennung von Spiellogik und Darstellung**:

```text
┌────────────────────────────────────────────────────────┐
│                      src/config.ts                     │
│           (Single Source of Truth Parameter)           │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│          src/core/           ││         src/render/          │
│   (Reine TypeScript-Logik,   ││    (Babylon.js Engine,       │
│    100% engine-unabhängig)   ││    Meshes, Glow, Kamera)     │
│                              ││                              │
│ • State Machine              ││ • Scene & Lighting           │
│ • Score Calculation          ││ • Player Mesh & Material     │
│ • Spawner & Pool Algorithm   ││ • Obstacle Renderers         │
│ • Collision Math (AABB)      ││ • Juice (Shake, Particles)   │
└──────────────┬───────────────┘└──────────────┬───────────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
┌────────────────────────────────────────────────────────┐
│                      src/main.ts                       │
│            (Application Entry & Game Loop)             │
└────────────────────────────────────────────────────────┘
```

---

## Modulverantwortlichkeiten

| Datei / Modul | Verantwortlichkeit | Engine-Abhängigkeit |
|---|---|---|
| `src/config.ts` | Alle Tuning-Parameter, Geschwindigkeiten, Farben, Geometrie-Konstanten | **Keine** (Plain TS) |
| `src/types.ts` | Zentrale Enums (`GameState`, `Lane`) und Interfaces (`Obstacle`, `Input`) | **Keine** (Plain TS) |
| `src/core/score.ts` | Berechnung von Score, Near-Miss-Bonus und Highscore-Verwaltung | **Keine** (Unit-testbar) |
| `src/core/state.ts` | Formale State-Machine-Logik (Transitions & Guards) | **Keine** (Unit-testbar) |
| `src/core/spawner.ts` | Mathematische Bestimmung der Hindernis-Positionen und Geschwindigkeitskurve | **Keine** (Unit-testbar) |
| `src/core/collision.ts` | 2D/3D-Bounding-Box (AABB) Überlappungsprüfung | **Keine** (Unit-testbar) |
| `src/render/scene.ts` | Babylon.js Engine-Initialisierung, Szenenbaum, GlowLayer, Kamera | Babylon.js |
| `src/render/highway.ts` | Darstellung der Straße, Gitter-Textur, Scroll-Shader | Babylon.js |
| `src/render/player.ts` | Babylon.js Mesh für das Raumschiff, Banking-Animationen | Babylon.js |
| `src/render/obstacles.ts` | Mesh-Pool für Hindernisse (Kuben, Neon-Gates) | Babylon.js |
| `src/render/ui.ts` | In-Game GUI (Score, GameOver Screen, Start-Overlay via Babylon GUI) | Babylon.js GUI |
| `src/main.ts` | Verdrahtung des Render-Loops mit Delta-Time-Passing an den Core | Glue Code |

---

## Qualitätssicherung & Testbarkeit

* **Automatisierte Tests:**
  - Da alle Module unter `src/core/` keine WebGL-/DOM-Abhängigkeiten besitzen, können sie extrem schnell mit **Vitest** in einer Node-Umgebung getestet werden.
  - Prüfungsrelevanter CI-Workflow: Jeder Push muss `npm run build` (`tsc && vite build`) sowie `npm test` (`vitest run`) bestehen.
