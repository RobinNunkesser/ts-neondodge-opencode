import { config } from "../config.ts";
import type { AABB, Obstacle } from "../types.ts";

export function laneSpacing(): number {
  return config.gameplay.roadWidth / config.gameplay.laneCount;
}

export function laneX(lane: number): number {
  const center = (config.gameplay.laneCount - 1) / 2;
  return (lane - center) * laneSpacing();
}

export function obstacleSpeedAt(elapsedSeconds: number): number {
  const gained =
    config.gameplay.speedIncreasePerMin * (elapsedSeconds / config.secondsPerMinute);
  return Math.min(config.gameplay.baseObstacleSpeed + gained, config.gameplay.maxObstacleSpeed);
}

export function spawnIntervalSecondsAt(elapsedSeconds: number): number {
  const progress = Math.min(elapsedSeconds / config.spawner.spawnRampSeconds, 1);
  const intervalMs =
    config.spawner.initialSpawnIntervalMs +
    (config.spawner.minSpawnIntervalMs - config.spawner.initialSpawnIntervalMs) * progress;
  return intervalMs / 1000;
}

export function pickSpawnLane(random: () => number): number {
  return Math.floor(random() * config.gameplay.laneCount) % config.gameplay.laneCount;
}

export function createObstacle(id: number, lane: number): Obstacle {
  return {
    id,
    lane,
    x: laneX(lane),
    z: config.spawner.spawnDistanceZ,
    width: config.spawner.obstacleWidth,
    height: config.spawner.obstacleHeight,
    depth: config.spawner.obstacleDepth,
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
