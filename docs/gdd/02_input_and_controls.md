# 02 - Input, Controls & Kamera

## Dual-Target Input-Spezifikation

Das Spiel muss ohne Code-Anpassung sowohl auf Desktop-Rechnern als auch auf mobilen Touch-Geräten nahtlos steuerbar sein.

### 1. Desktop-Steuerung
- **Horizontale Bewegung:**
  - `A` oder `Pfeiltaste Links` $\implies$ Bewegung nach links (`-X`)
  - `D` oder `Pfeiltaste Rechts` $\implies$ Bewegung nach rechts (`+X`)
- **System-Tasten:**
  - `Leertaste` $\implies$ Spielstart / Neustart nach Game Over
  - `Escape` oder `P` $\implies$ Pause ein- / ausschalten

### 2. Mobile Touch-Steuerung
- **Touch-Drag / Virtual Thumb:**
  - Horizontales Wischen über das Display bewegt den Gleiter relativ zur Wischdistanz.
- **Alternativ (Tap Zones):**
  - Tippen auf die linke Bildschirmhälfte $\implies$ nach links driften.
  - Tippen auf die rechte Bildschirmhälfte $\implies$ nach rechts driften.
  - Tippen bei Game Over $\implies$ Neustart.

---

## Bewegungsdynamik (Kinematik)

- **Begrenzung:** Der Spieler kann sich ausschließlich entlang der horizontalen Achse bewegen:
  $$x \in [-\text{ROAD\_WIDTH} / 2, +\text{ROAD\_WIDTH} / 2]$$
- **Glättung (Damping / Lerp):**
  - Keine sprunghafte (teleportartige) Verschiebung.
  - Horizontale Position wird über `lerp(currentX, targetX, damping * deltaTime)` interpoliert, um ein träges, sportliches Gleiter-Gefühl zu erzeugen.
- **Banking / Tilting (Visuelles Feedback):**
  - Bei Linksbewegung neigt sich der Gleiter um die Z-Achse leicht nach links (Rollwinkel z. B. $+15^\circ$).
  - Bei Rechtsbewegung neigt sich der Gleiter leicht nach rechts (Rollwinkel z. B. $-15^\circ$).
  - Im Stillstand richtet sich der Gleiter selbsttätig wieder waagerecht aus.

---

## Kamera-Setup

- **Perspektive:** Third-Person Chase Camera (fest hinter und leicht über dem Spieler positioniert).
- **Positionierung:**
  - Kamera folgt der horizontalen X-Position des Spielers mit leichtem Lag (Smooth Follow).
  - Fester Offset: $\Delta X = 0.3 \cdot x_{\text{player}}$, $\Delta Y = 3.5$, $\Delta Z = -8.0$.
  - Blickziel (LookAt): Punkt leicht vor dem Gleiter ($Z = +10$).
- **Field of View (FoV):**
  - Dynamisches FoV: Erhöht sich bei steigender Geschwindigkeit minimal, um den Eindruck von Tempo zu verstärken (z. B. $60^\circ \to 75^\circ$).

---

## Optical Flow & Kinematik der Relativbewegung (Treadmill-Prinzip)

- **Referenzsystem:**
  - Der Spieler-Gleiter ist auf der Z-Achse verankert ($z_{\text{player}} = 0$).
  - Die simulierte Vorwärtsbewegung wird über **Relativbewegung** der Welt vermittelt (Laufband-/Treadmill-Architektur).
- **Vektor des Optical Flow:**
  - Alle sichtbaren Elemente (Hindernisse, Highway-Markierungen) müssen sich zwingend mit dem Vektor $\vec{v} = (0, 0, -\text{speed})$ auf die Kamera zu bewegen.
- **Highway-Textur-Scrolling:**
  - Das Scrolling der Textur-V-Achse muss strikt positiv getaktet sein:
    $$v_{\text{offset}}(t + \Delta t) = v_{\text{offset}}(t) + \left(\frac{\text{speed}}{\text{roadLength}}\right) \cdot \Delta t$$
  - **Achtung vor der Vektions-Illusion:** Ein negatives Vorzeichen kehrt den wahrgenommenen optischen Fluss des Bodens um. Da die Straße den Großteil des Bildfelds ausmacht, erzeugt dies beim Spieler den irrtümlichen Eindruck einer Rückwärtsfahrt.
