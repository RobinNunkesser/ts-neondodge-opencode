import { config } from "../config.ts";

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class ScoreBoard {
  private elapsed = 0;
  private points = 0;
  private nearMisses = 0;
  private multiplier = 1;

  reset(): void {
    this.elapsed = 0;
    this.points = 0;
    this.nearMisses = 0;
    this.multiplier = 1;
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }
    this.elapsed += deltaSeconds;
    this.multiplier = 1 + Math.floor(this.elapsed / config.multiplierIntervalSeconds) * config.multiplierStep;
    this.points += config.pointsPerSecond * deltaSeconds * this.multiplier;
  }

  addNearMiss(): void {
    this.nearMisses += 1;
    this.points += config.nearMissBonus * this.multiplier;
  }

  get value(): number {
    return Math.floor(this.points);
  }

  get getMultiplier(): number {
    return this.multiplier;
  }

  get getNearMisses(): number {
    return this.nearMisses;
  }

  get survivedSeconds(): number {
    return this.elapsed;
  }
}

export function loadHighscore(storage: Storage): number {
  const raw = storage.getItem(config.highscoreStorageKey);
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveHighscore(storage: Storage, score: number): number {
  const best = Math.max(loadHighscore(storage), Math.floor(score));
  storage.setItem(config.highscoreStorageKey, String(best));
  return best;
}
