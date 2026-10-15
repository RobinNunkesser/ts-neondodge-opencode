import { Vector3 } from "@babylonjs/core";
import { config } from "./config.ts";
import { intersects, isNearMiss, playerToAABB } from "./core/collision.ts";
import { ScoreBoard, loadHighscore, saveHighscore, type Storage } from "./core/score.ts";
import {
  createObstacle,
  obstacleSpeedAt,
  obstacleToAABB,
  pickSpawnLane,
  spawnIntervalSecondsAt,
} from "./core/spawner.ts";
import { StateMachine } from "./core/state.ts";
import { GameScene } from "./render/scene.ts";
import { Highway } from "./render/highway.ts";
import { Obstacles } from "./render/obstacles.ts";
import { Player } from "./render/player.ts";
import { GameUI } from "./render/ui.ts";
import type { Input, Obstacle, PlayerState } from "./types.ts";

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
if (canvas === null) {
  throw new Error("Canvas #game-canvas not found");
}

const storage: Storage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};

const gameScene = new GameScene(canvas);
const highway = new Highway(gameScene.scene);
const player = new Player(gameScene.scene);
const obstacleRenderer = new Obstacles(gameScene.scene);
const ui = new GameUI(gameScene.scene);

const machine = new StateMachine("MENU");
const scoreBoard = new ScoreBoard();

const input: Input = { left: false, right: false };
const playerState: PlayerState = {
  x: 0,
  targetX: 0,
  tilt: 0,
  width: config.player.width,
  height: config.player.height,
  depth: config.player.depth,
};

let highscore = loadHighscore(storage);
let obstacles: Obstacle[] = [];
let nextObstacleId = 1;
let spawnTimer = 0;
let lastPlayerX = 0;
let crashSpeed = 0;

const minPlayerX = -config.gameplay.roadWidth / 2 + playerState.width / 2;
const maxPlayerX = config.gameplay.roadWidth / 2 - playerState.width / 2;

function clampTargetX(value: number): number {
  return Math.max(minPlayerX, Math.min(maxPlayerX, value));
}

function resetRun(): void {
  scoreBoard.reset();
  playerState.x = 0;
  playerState.targetX = 0;
  playerState.tilt = 0;
  lastPlayerX = 0;
  obstacles = [];
  obstacleRenderer.clear();
  spawnTimer = 0;
  crashSpeed = 0;
  player.setVisible(true);
  ui.setScore(0);
  ui.setMultiplier(1, 0);
}

function startGame(event: "START" | "RESTART"): void {
  machine.dispatch(event);
  resetRun();
  ui.showPlaying();
}

function handleAction(): void {
  switch (machine.state) {
    case "MENU":
      startGame("START");
      break;
    case "GAME_OVER":
      startGame("RESTART");
      break;
    default:
      break;
  }
}

function togglePause(): void {
  if (machine.state === "PLAYING") {
    machine.dispatch("TOGGLE_PAUSE");
    ui.showPaused();
  } else if (machine.state === "PAUSED") {
    machine.dispatch("TOGGLE_PAUSE");
    ui.showPlaying();
  }
}

function spawnObstacle(): void {
  const lane = pickSpawnLane(Math.random);
  obstacles.push(createObstacle(nextObstacleId, lane));
  nextObstacleId += 1;
}

function simulatePlaying(dt: number): void {
  const g = config.gameplay;
  scoreBoard.update(dt);
  const elapsed = scoreBoard.survivedSeconds;
  const speed = obstacleSpeedAt(elapsed);

  highway.update(dt, speed);
  gameScene.setSpeedFov((speed - g.baseObstacleSpeed) / (g.maxObstacleSpeed - g.baseObstacleSpeed));

  if (input.left) {
    playerState.targetX -= g.playerSpeed * dt;
  }
  if (input.right) {
    playerState.targetX += g.playerSpeed * dt;
  }
  playerState.targetX = clampTargetX(playerState.targetX);

  const t = Math.min(1, g.playerDamping * dt);
  playerState.x += (playerState.targetX - playerState.x) * t;

  const velocity = dt > 0 ? (playerState.x - lastPlayerX) / dt : 0;
  const desiredTilt = Math.max(-1, Math.min(1, -velocity / g.playerSpeed)) * g.playerMaxTilt;
  playerState.tilt += (desiredTilt - playerState.tilt) * t;
  lastPlayerX = playerState.x;

  player.update(playerState.x, playerState.tilt, dt);

  spawnTimer += dt;
  const spawnInterval = spawnIntervalSecondsAt(elapsed);
  while (spawnTimer >= spawnInterval) {
    spawnTimer -= spawnInterval;
    spawnObstacle();
  }

  const playerBox = playerToAABB(playerState);
  const speedStep = speed * dt;

  for (const obstacle of obstacles) {
    obstacle.z -= speedStep;
  }

  for (const obstacle of obstacles) {
    if (intersects(playerBox, obstacleToAABB(obstacle))) {
      triggerGameOver(speed);
      return;
    }
    if (!obstacle.nearMissChecked && obstacle.z <= (obstacle.depth + playerState.depth) / 2) {
      obstacle.nearMissChecked = true;
      if (isNearMiss(playerBox, obstacleToAABB(obstacle), g.nearMissDistance)) {
        scoreBoard.addNearMiss();
      }
    }
  }

  obstacles = obstacles.filter((obstacle) => obstacle.z > config.spawner.despawnDistanceZ);

  gameScene.updateCamera(playerState.x, dt);
  obstacleRenderer.render(obstacles);
  ui.setScore(scoreBoard.value);
  ui.setMultiplier(scoreBoard.multiplierValue, scoreBoard.nearMissCount);
}

function triggerGameOver(speed: number): void {
  machine.dispatch("COLLISION");
  crashSpeed = speed;
  gameScene.triggerShake();
  gameScene.burstExplosion(new Vector3(playerState.x, config.player.y, 0));
  player.setVisible(false);
  const isNewHighscore = scoreBoard.value > highscore;
  highscore = saveHighscore(storage, scoreBoard.value);
  ui.showGameOver(scoreBoard.value, highscore, isNewHighscore);
}

function updateIdle(dt: number): void {
  highway.update(dt, config.gameplay.menuScrollSpeed);
  player.update(playerState.x, playerState.tilt, dt);
  gameScene.updateCamera(playerState.x, dt);
}

function updateGameOver(dt: number): void {
  crashSpeed = Math.max(0, crashSpeed - config.gameplay.crashDeceleration * dt);
  highway.update(dt, crashSpeed);
  const step = crashSpeed * dt;
  for (const obstacle of obstacles) {
    obstacle.z -= step;
  }
  obstacles = obstacles.filter((obstacle) => obstacle.z > config.spawner.despawnDistanceZ);
  obstacleRenderer.render(obstacles);
}

function step(dt: number): void {
  switch (machine.state) {
    case "PLAYING":
      simulatePlaying(dt);
      break;
    case "MENU":
      updateIdle(dt);
      break;
    case "PAUSED":
      break;
    case "GAME_OVER":
      updateGameOver(dt);
      break;
  }
}

function onKeyDown(event: KeyboardEvent): void {
  switch (event.code) {
    case "ArrowLeft":
    case "KeyA":
      input.left = true;
      break;
    case "ArrowRight":
    case "KeyD":
      input.right = true;
      break;
    case "Space":
      event.preventDefault();
      handleAction();
      break;
    case "Escape":
    case "KeyP":
      togglePause();
      break;
    default:
      break;
  }
}

function onKeyUp(event: KeyboardEvent): void {
  switch (event.code) {
    case "ArrowLeft":
    case "KeyA":
      input.left = false;
      break;
    case "ArrowRight":
    case "KeyD":
      input.right = false;
      break;
    default:
      break;
  }
}

const touch = {
  pointerId: null as number | null,
  startX: 0,
  startTargetX: 0,
  moved: false,
};

function worldUnitsPerPixel(): number {
  const width = canvas.clientWidth || canvas.width || 1;
  return (config.gameplay.roadWidth / width) * config.input.touchDragSensitivity;
}

function onPointerDown(event: PointerEvent): void {
  if (machine.state === "MENU" || machine.state === "GAME_OVER") {
    handleAction();
    return;
  }
  if (machine.state !== "PLAYING" || event.pointerType !== "touch") {
    return;
  }
  touch.pointerId = event.pointerId;
  touch.startX = event.clientX;
  touch.startTargetX = playerState.targetX;
  touch.moved = false;
  canvas.setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent): void {
  if (touch.pointerId === null || event.pointerId !== touch.pointerId) {
    return;
  }
  const dx = event.clientX - touch.startX;
  if (Math.abs(dx) >= config.input.touchDeadZonePx) {
    touch.moved = true;
  }
  if (!touch.moved) {
    return;
  }
  playerState.targetX = clampTargetX(touch.startTargetX + dx * worldUnitsPerPixel());
}

function onPointerUp(event: PointerEvent): void {
  if (touch.pointerId === null || event.pointerId !== touch.pointerId) {
    return;
  }
  if (!touch.moved && machine.state === "PLAYING") {
    const rect = canvas.getBoundingClientRect();
    const tappedLeft = event.clientX < rect.left + rect.width / 2;
    const drift = tappedLeft ? -config.input.touchTapDrift : config.input.touchTapDrift;
    playerState.targetX = clampTargetX(playerState.targetX + drift);
  }
  canvas.releasePointerCapture(event.pointerId);
  touch.pointerId = null;
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerUp);

ui.setScore(0);
ui.setMultiplier(1, 0);
ui.showMenu(highscore);

gameScene.engine.runRenderLoop(() => {
  const dt = Math.min(gameScene.engine.getDeltaTime() / 1000, config.gameplay.maxDeltaSeconds);
  step(dt);
  gameScene.render();
});
