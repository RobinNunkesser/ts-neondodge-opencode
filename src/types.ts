export type GameState = "MENU" | "PLAYING" | "PAUSED" | "GAME_OVER";

export type GameEvent = "START" | "TOGGLE_PAUSE" | "COLLISION" | "RESTART";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface Input {
  left: boolean;
  right: boolean;
}

export interface Obstacle {
  id: number;
  lane: number;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  passed: boolean;
  nearMissChecked: boolean;
}

export interface PlayerState {
  x: number;
  targetX: number;
  tilt: number;
  width: number;
  height: number;
  depth: number;
}
