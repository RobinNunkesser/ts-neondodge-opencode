import { config } from "./config.ts";
import {
  intersects,
  isNearMiss,
  playerToAABB,
} from "./core/collision.ts";
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
  width: config.playerWidth,
  height: config.playerHeight,
  depth: config.playerDepth,
};

let highscore = loadHighscore(storage);
let obstacles: Obstacle[] = [];
let nextObstacleId = 1;
let spawnTimer = 0;
let lastPlayerX = 0;
let crashSpeed = 0;

const minPlayerX = -config.roadWidth / 2 + playerState.width / 2;
const maxPlayerX = config.roadWidth / 2 - playerState.width / 2;

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
  scoreBoard.update(dt);
  const elapsed = scoreBoard.survivedSeconds;
  const speed = obstacleSpeedAt(elapsed);

  highway.update(dt, speed);
  gameScene.setSpeedFov((speed - config.baseObstacleSpeed) / (config.maxObstacleSpeed - config.baseObstacleSpeed));

  if (input.left) {
    playerState.targetX -= config.playerSpeed * dt;
  }
  if (input.right) {
    playerState.targetX += config.playerSpeed * dt;
  }
  playerState.targetX = Math.max(minPlayerX, Math.min(maxPlayerX, playerState.targetX));

  const t = Math.min(1, config.playerDamping * dt);
  playerState.x += (playerState.targetX - playerState.x) * t;

  const velocity = dt > 0 ? (playerState.x - lastPlayerX) / dt : 0;
  const desiredTilt = Math.max(-1, Math.min(1, -velocity / config.playerSpeed)) * config.playerMaxTilt;
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
      if (isNearMiss(playerBox, obstacleToAABB(obstacle), config.nearMissDistance)) {
        scoreBoard.addNearMiss();
      }
    }
  }

  obstacles = obstacles.filter((obstacle) => obstacle.z > config.despawnDistanceZ);

  gameScene.updateCamera(playerState.x, dt);
  obstacleRenderer.render(obstacles);
  ui.setScore(scoreBoard.value);
  ui.setMultiplier(scoreBoard.getMultiplier, scoreBoard.getNearMisses);
}

function triggerGameOver(speed: number): void {
  machine.dispatch("COLLISION");
  crashSpeed = speed;
  player.setVisible(false);
  const isNewHighscore = scoreBoard.value > highscore;
  highscore = saveHighscore(storage, scoreBoard.value);
  ui.showGameOver(scoreBoard.value, highscore, isNewHighscore);
}

function updateIdle(dt: number): void {
  highway.update(dt, config.menuScrollSpeed);
  player.update(playerState.x, playerState.tilt, dt);
  gameScene.updateCamera(playerState.x, dt);
}

function updateGameOver(dt: number): void {
  crashSpeed = Math.max(0, crashSpeed - config.crashDeceleration * dt);
  highway.update(dt, crashSpeed);
  const step = crashSpeed * dt;
  for (const obstacle of obstacles) {
    obstacle.z -= step;
  }
  obstacles = obstacles.filter((obstacle) => obstacle.z > config.despawnDistanceZ);
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

function onPointerDown(): void {
  if (machine.state === "MENU" || machine.state === "GAME_OVER") {
    handleAction();
  }
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
canvas.addEventListener("pointerdown", onPointerDown);

ui.setScore(0);
ui.setMultiplier(1, 0);
ui.showMenu(highscore);

gameScene.engine.runRenderLoop(() => {
  const dt = Math.min(gameScene.engine.getDeltaTime() / 1000, config.maxDeltaSeconds);
  step(dt);
  gameScene.render();
});
