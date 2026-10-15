import type { AABB, PlayerState } from "../types.ts";

export function playerToAABB(player: PlayerState): AABB {
  const halfWidth = player.width / 2;
  const halfDepth = player.depth / 2;
  return {
    minX: player.x - halfWidth,
    maxX: player.x + halfWidth,
    minY: 0,
    maxY: player.height,
    minZ: -halfDepth,
    maxZ: halfDepth,
  };
}

export function intersects(a: AABB, b: AABB): boolean {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY &&
    a.minZ <= b.maxZ &&
    a.maxZ >= b.minZ
  );
}

export function horizontalGap(a: AABB, b: AABB): number {
  const gapX = Math.max(b.minX - a.maxX, a.minX - b.maxX);
  const gapZ = Math.max(b.minZ - a.maxZ, a.minZ - b.maxZ);
  return Math.max(gapX, gapZ);
}

export function isNearMiss(a: AABB, b: AABB, threshold: number): boolean {
  return !intersects(a, b) && horizontalGap(a, b) <= threshold;
}
