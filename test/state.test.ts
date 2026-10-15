import { describe, expect, it } from "vitest";
import { StateMachine } from "../src/core/state.ts";

describe("StateMachine", () => {
  it("starts in MENU by default", () => {
    expect(new StateMachine().state).toBe("MENU");
  });

  it("accepts an explicit initial state", () => {
    expect(new StateMachine("GAME_OVER").state).toBe("GAME_OVER");
  });

  it("MENU --START--> PLAYING", () => {
    const sm = new StateMachine("MENU");
    expect(sm.dispatch("START")).toBe("PLAYING");
  });

  it("PLAYING --TOGGLE_PAUSE--> PAUSED and back", () => {
    const sm = new StateMachine("PLAYING");
    expect(sm.dispatch("TOGGLE_PAUSE")).toBe("PAUSED");
    expect(sm.dispatch("TOGGLE_PAUSE")).toBe("PLAYING");
  });

  it("PLAYING --COLLISION--> GAME_OVER", () => {
    const sm = new StateMachine("PLAYING");
    expect(sm.dispatch("COLLISION")).toBe("GAME_OVER");
  });

  it("GAME_OVER --RESTART--> PLAYING", () => {
    const sm = new StateMachine("GAME_OVER");
    expect(sm.dispatch("RESTART")).toBe("PLAYING");
  });

  it("ignores invalid events (guard)", () => {
    const sm = new StateMachine("MENU");
    expect(sm.dispatch("COLLISION")).toBe("MENU");
    expect(sm.dispatch("RESTART")).toBe("MENU");
    expect(sm.dispatch("TOGGLE_PAUSE")).toBe("MENU");
  });

  it("ignores COLLISION while PAUSED", () => {
    const sm = new StateMachine("PAUSED");
    expect(sm.dispatch("COLLISION")).toBe("PAUSED");
  });

  it("can() reports allowed transitions", () => {
    const sm = new StateMachine("PLAYING");
    expect(sm.can("COLLISION")).toBe(true);
    expect(sm.can("TOGGLE_PAUSE")).toBe(true);
    expect(sm.can("START")).toBe(false);
    expect(sm.can("RESTART")).toBe(false);
  });

  it("reset() returns to MENU", () => {
    const sm = new StateMachine("PLAYING");
    sm.reset();
    expect(sm.state).toBe("MENU");
  });
});
