export const config = {
  roadWidth: 14.0,
  roadLength: 120.0,
  playerSpeed: 18.0,
  playerDamping: 12.0,
  playerMaxTilt: 0.35,
  playerWidth: 2.0,
  playerHeight: 1.2,
  playerDepth: 2.6,
  playerY: 0.9,
  playerBobAmplitude: 0.12,
  playerBobSpeed: 2.4,
  baseObstacleSpeed: 24.0,
  speedIncreasePerMin: 4.0,
  maxObstacleSpeed: 55.0,

  spawnDistanceZ: 85.0,
  despawnDistanceZ: -10.0,
  initialSpawnIntervalMs: 900,
  minSpawnIntervalMs: 380,
  spawnRampSeconds: 120,
  obstacleWidth: 2.8,
  obstacleHeight: 2.2,
  obstacleDepth: 2.8,

  laneCount: 3,

  colorPrimaryCyan: "#00f0ff",
  colorAccentMagenta: "#ff0055",
  colorAccentYellow: "#ffe600",
  colorBgVoid: "#080710",
  glowIntensity: 0.85,
  bloomThreshold: 0.4,

  shakeDurationMs: 250,
  shakeMagnitude: 0.45,
  nearMissDistance: 1.2,
  particleCountCrash: 40,

  pointsPerSecond: 10,
  nearMissBonus: 50,
  multiplierStep: 0.5,
  multiplierIntervalSeconds: 60,
  highscoreStorageKey: "neondodge.highscore",

  cameraOffsetX: 0.3,
  cameraOffsetY: 3.5,
  cameraOffsetZ: -8.0,
  cameraLookAtZ: 10.0,
  cameraBaseFovDeg: 60,
  cameraMaxFovDeg: 75,
  cameraFollowLerp: 4.0,

  menuScrollSpeed: 12.0,
  crashDeceleration: 40.0,
  maxDeltaSeconds: 0.05,
} as const;

export type Config = typeof config;
