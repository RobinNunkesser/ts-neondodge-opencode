import { config } from "../config.ts";
import type { AABB, Obstacle } from "../types.ts";

export function laneSpacing(): number {
  return config.roadWidth / config.laneCount;
}

export function laneX(lane: number): number {
  const center = (config.laneCount - 1) / 2;
  return (lane - center) * laneSpacing();
}

export function obstacleSpeedAt(elapsedSeconds: number): number {
  const gained = config.speedIncreasePerMin * (elapsedSeconds / 60);
  return Math.min(config.baseObstacleSpeed + gained, config.maxObstacleSpeed);
}

export function spawnIntervalSecondsAt(elapsedSeconds: number): number {
  const progress = Math.min(elapsedSeconds / config.spawnRampSeconds, 1);
  const intervalMs =
    config.initialSpawnIntervalMs +
    (config.minSpawnIntervalMs - config.initialSpawnIntervalMs) * progress;
  return intervalMs / 1000;
}

export function pickSpawnLane(random: () => number): number {
  return Math.floor(random() * config.laneCount) % config.laneCount;
}

export function createObstacle(id: number, lane: number): Obstacle {
  return {
    id,
    lane,
    x: laneX(lane),
    z: config.spawnDistanceZ,
    width: config.obstacleWidth,
    height: config.obstacleHeight,
    depth: config.obstacleDepth,
    passed: false,
    nearMissChecked: false,
  };
}

export function obstacleToAABB(obstacle: Obstacle): AABB {
  const halfWidth = obstacle.width / 2;
  const halfDepth = obstacle.depth / 2;
  return {
    minX: obstacle.x - halfWidth,
    maxX: obstacle.x + halfWidth,
    minY: 0,
    maxY: obstacle.height,
    minZ: obstacle.z - halfDepth,
    maxZ: obstacle.z + halfDepth,
  };
}
