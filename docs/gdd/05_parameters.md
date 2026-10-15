# 05 - Konfigurationsparameter & Tuning-Referenz

## Die Konfigurationsdatei `src/config.ts`

Um den agentischen Entwicklungsprozess abzusichern, müssen alle relevanten Zahlenwerte, Geschwindigkeiten, Farben und Schwellenwerte zentral in `src/config.ts` definiert sein. Weder die Spiellogik noch das Rendering dürfen Magic Numbers enthalten.

---

## Parameter-Katalog

### 1. Gameplay & Kinematik

| Parameter | Typ | Default | Einheit | Beschreibung |
|---|---|---|---|---|
| `roadWidth` | `number` | `14.0` | World Units | Gesamtbreite des befahrbaren Highways ($X \in [-7, +7]$) |
| `roadLength` | `number` | `120.0` | World Units | Sichtbare Länge des Highways in die Tiefe ($+Z$) |
| `playerSpeed` | `number` | `18.0` | Units / s | Horizontale Steuerungsgeschwindigkeit des Gleiters |
| `playerDamping` | `number` | `12.0` | Faktor | Dämpfungsfaktor für weiches Ansprechverhalten (Lerp) |
| `playerMaxTilt` | `number` | `0.35` | Radiant | Maximaler Neigungswinkel beim Lenken ($\approx 20^\circ$) |
| `baseObstacleSpeed` | `number` | `24.0` | Units / s | Anfangsgeschwindigkeit, mit der Hindernisse auf den Spieler zukommen |
| `speedIncreasePerMin`| `number` | `4.0` | Units / s | Geschwindigkeitszuwachs pro 60 Sekunden Spielzeit |
| `maxObstacleSpeed` | `number` | `55.0` | Units / s | Maximal erreichbare Hindernisgeschwindigkeit |

---

### 2. Spawner & Hindernisse

| Parameter | Typ | Default | Einheit | Beschreibung |
|---|---|---|---|---|
| `spawnDistanceZ` | `number` | `85.0` | World Units | Z-Distanz, an der Hindernisse erzeugt werden |
| `despawnDistanceZ` | `number` | `-10.0` | World Units | Z-Distanz hinter der Kamera, an der Hindernisse gelöscht werden |
| `initialSpawnIntervalMs` | `number` | `900` | Millisekunden | Zeitabstand zwischen zwei Hindernis-Spawns |
| `minSpawnIntervalMs` | `number` | `380` | Millisekunden | Minimaler Zeitabstand im späteren Spielverlauf |
| `obstacleWidth` | `number` | `2.8` | World Units | Standardbreite eines Hindernisblocks |
| `obstacleHeight` | `number` | `2.2` | World Units | Höhe eines Hindernisblocks |

---

### 3. Visuelle Ästhetik (Neon-Palette)

| Token | Hex-Wert | Verwendung |
|---|---|---|
| `COLOR_PRIMARY_CYAN` | `#00f0ff` | Gleiter, Gitterlinien des Highways, primäre UI |
| `COLOR_ACCENT_MAGENTA` | `#ff0055` | Hindernisse, Gefahrenanzeigen, Crash-Partikel |
| `COLOR_ACCENT_YELLOW` | `#ffe600` | Power-Ups / Near-Miss Indikator |
| `COLOR_BG_VOID` | `#080710` | Hintergrund-/Nebel-Farbe des Weltraums |
| `glowIntensity` | `0.85` | Stärke des Babylon.js `GlowLayer` für Leuchteffekte |
| `bloomThreshold` | `0.40` | Schwellenwert für das Überstrahlen von Neon-Meshes |

---

### 4. Game Feel & Juice

| Parameter | Typ | Default | Beschreibung |
|---|---|---|---|
| `shakeDurationMs` | `number` | `250` | Dauer des Kameraschüttelns bei Kollision |
| `shakeMagnitude` | `number` | `0.45` | Intensität des Kameraschüttelns |
| `nearMissDistance` | `number` | `1.2` | Maximaler Abstand für Auslösen eines „Near Miss“-Bonus |
| `particleCountCrash` | `number` | `40` | Anzahl emittierter Fragmente bei Zerstörung des Gleiters |
