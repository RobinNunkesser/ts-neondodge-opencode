import { describe, expect, it } from "vitest";
import {
  horizontalGap,
  intersects,
  isNearMiss,
  playerToAABB,
} from "../src/core/collision.ts";
import type { AABB, PlayerState } from "../src/types.ts";

function box(minX: number, maxX: number, minZ: number, maxZ: number): AABB {
  return { minX, maxX, minY: 0, maxY: 1, minZ, maxZ };
}

describe("intersects", () => {
  it("detects overlapping boxes", () => {
    expect(intersects(box(-1, 1, -1, 1), box(0, 2, 0, 2))).toBe(true);
  });

  it("treats exactly touching edges as an intersection", () => {
    expect(intersects(box(-1, 0, 0, 1), box(0, 1, 0, 1))).toBe(true);
  });

  it("returns false for separated boxes on X", () => {
    expect(intersects(box(-3, -2, 0, 1), box(0, 1, 0, 1))).toBe(false);
  });

  it("returns false for separated boxes on Z only", () => {
    expect(intersects(box(-1, 1, 5, 6), box(-1, 1, 0, 1))).toBe(false);
  });
});

describe("horizontalGap", () => {
  it("is zero distance on the axis with least separation", () => {
    expect(horizontalGap(box(0, 1, 0, 1), box(1, 2, 0, 1))).toBe(0);
  });

  it("reports the largest axis gap for corner-separated boxes", () => {
    expect(horizontalGap(box(0, 1, 0, 1), box(3, 4, 2, 3))).toBe(2);
  });

  it("is negative when boxes overlap", () => {
    expect(horizontalGap(box(-1, 1, -1, 1), box(0, 2, 0, 2))).toBeLessThan(0);
  });
});

describe("isNearMiss", () => {
  it("is true when the gap is within the threshold", () => {
    expect(isNearMiss(box(0, 1, 0, 1), box(1, 2, 2, 3), 1.2)).toBe(true);
  });

  it("is false when the gap exceeds the threshold", () => {
    expect(isNearMiss(box(0, 1, 0, 1), box(3, 4, 3, 4), 1.2)).toBe(false);
  });

  it("is false on an actual collision", () => {
    expect(isNearMiss(box(0, 2, 0, 2), box(1, 3, 1, 3), 1.2)).toBe(false);
  });
});

describe("playerToAABB", () => {
  it("centers the box on the player position in X and Z", () => {
    const player: PlayerState = { x: 2, targetX: 0, tilt: 0, width: 2, height: 1.2, depth: 2.6 };
    const aabb = playerToAABB(player);
    expect(aabb).toEqual({
      minX: 1,
      maxX: 3,
      minY: 0,
      maxY: 1.2,
      minZ: -1.3,
      maxZ: 1.3,
    });
  });
});
