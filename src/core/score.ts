import { config } from "../config.ts";

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class ScoreBoard {
  private elapsed = 0;
  private points = 0;
  private nearMisses = 0;
  private multiplier: number = config.score.baseMultiplier;

  reset(): void {
    this.elapsed = 0;
    this.points = 0;
    this.nearMisses = 0;
    this.multiplier = config.score.baseMultiplier;
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }
    this.elapsed += deltaSeconds;
    this.multiplier = this.multiplierAt(this.elapsed);
    this.points += config.score.pointsPerSecond * deltaSeconds * this.multiplier;
  }

  addNearMiss(): void {
    this.nearMisses += 1;
    this.points += config.score.nearMissBonus * this.multiplier;
  }

  get value(): number {
    return Math.floor(this.points);
  }

  get multiplierValue(): number {
    return this.multiplier;
  }

  get nearMissCount(): number {
    return this.nearMisses;
  }

  get survivedSeconds(): number {
    return this.elapsed;
  }

  private multiplierAt(elapsedSeconds: number): number {
    const steps = Math.floor(elapsedSeconds / config.score.multiplierIntervalSeconds);
    return config.score.baseMultiplier + steps * config.score.multiplierStep;
  }
}

export function loadHighscore(storage: Storage): number {
  const raw = storage.getItem(config.score.highscoreStorageKey);
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveHighscore(storage: Storage, score: number): number {
  const best = Math.max(loadHighscore(storage), Math.floor(score));
  storage.setItem(config.score.highscoreStorageKey, String(best));
  return best;
}
