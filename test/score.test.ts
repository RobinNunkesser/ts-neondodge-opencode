import { describe, expect, it } from "vitest";
import { config } from "../src/config.ts";
import {
  ScoreBoard,
  loadHighscore,
  saveHighscore,
  type Storage,
} from "../src/core/score.ts";

class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe("ScoreBoard", () => {
  it("starts at zero", () => {
    const board = new ScoreBoard();
    expect(board.value).toBe(0);
    expect(board.multiplierValue).toBe(1);
    expect(board.nearMissCount).toBe(0);
  });

  it("awards passive points per survived second", () => {
    const board = new ScoreBoard();
    board.update(1);
    expect(board.value).toBe(config.score.pointsPerSecond);
    expect(board.survivedSeconds).toBe(1);
  });

  it("ignores non-positive delta time", () => {
    const board = new ScoreBoard();
    board.update(0);
    board.update(-5);
    expect(board.value).toBe(0);
    expect(board.survivedSeconds).toBe(0);
  });

  it("raises the multiplier after each interval", () => {
    const board = new ScoreBoard();
    board.update(config.score.multiplierIntervalSeconds);
    expect(board.multiplierValue).toBe(1 + config.score.multiplierStep);
  });

  it("adds the near-miss bonus", () => {
    const board = new ScoreBoard();
    board.addNearMiss();
    expect(board.value).toBe(config.score.nearMissBonus);
    expect(board.nearMissCount).toBe(1);
  });

  it("applies the multiplier to the near-miss bonus", () => {
    const board = new ScoreBoard();
    board.update(config.score.multiplierIntervalSeconds);
    board.addNearMiss();
    const expected =
      config.score.pointsPerSecond * config.score.multiplierIntervalSeconds * 1.5 +
      config.score.nearMissBonus * 1.5;
    expect(board.value).toBe(Math.floor(expected));
  });

  it("floors the displayed score", () => {
    const board = new ScoreBoard();
    board.update(0.15);
    expect(board.value).toBe(Math.floor(config.score.pointsPerSecond * 0.15));
  });

  it("reset clears all progress", () => {
    const board = new ScoreBoard();
    board.update(config.score.multiplierIntervalSeconds);
    board.addNearMiss();
    board.reset();
    expect(board.value).toBe(0);
    expect(board.multiplierValue).toBe(1);
    expect(board.nearMissCount).toBe(0);
    expect(board.survivedSeconds).toBe(0);
  });
});

describe("highscore persistence", () => {
  it("defaults to zero without a stored value", () => {
    expect(loadHighscore(new MemoryStorage())).toBe(0);
  });

  it("ignores invalid stored values", () => {
    const storage = new MemoryStorage();
    storage.setItem(config.score.highscoreStorageKey, "not-a-number");
    expect(loadHighscore(storage)).toBe(0);
  });

  it("loads a stored value", () => {
    const storage = new MemoryStorage();
    storage.setItem(config.score.highscoreStorageKey, "1234");
    expect(loadHighscore(storage)).toBe(1234);
  });

  it("stores a new best score", () => {
    const storage = new MemoryStorage();
    expect(saveHighscore(storage, 500)).toBe(500);
    expect(loadHighscore(storage)).toBe(500);
  });

  it("keeps the higher of stored and submitted scores", () => {
    const storage = new MemoryStorage();
    saveHighscore(storage, 500);
    expect(saveHighscore(storage, 200)).toBe(500);
    expect(saveHighscore(storage, 900)).toBe(900);
    expect(loadHighscore(storage)).toBe(900);
  });
});
