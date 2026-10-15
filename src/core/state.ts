import type { GameEvent, GameState } from "../types.ts";

type TransitionTable = Record<GameState, Partial<Record<GameEvent, GameState>>>;

const TRANSITIONS: TransitionTable = {
  MENU: { START: "PLAYING" },
  PLAYING: { TOGGLE_PAUSE: "PAUSED", COLLISION: "GAME_OVER" },
  PAUSED: { TOGGLE_PAUSE: "PLAYING" },
  GAME_OVER: { RESTART: "PLAYING" },
};

export class StateMachine {
  private current: GameState;

  constructor(initial: GameState = "MENU") {
    this.current = initial;
  }

  get state(): GameState {
    return this.current;
  }

  can(event: GameEvent): boolean {
    return TRANSITIONS[this.current][event] !== undefined;
  }

  dispatch(event: GameEvent): GameState {
    const next = TRANSITIONS[this.current][event];
    if (next === undefined) {
      return this.current;
    }
    this.current = next;
    return this.current;
  }

  reset(): void {
    this.current = "MENU";
  }
}
