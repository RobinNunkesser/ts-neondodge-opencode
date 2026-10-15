import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";
import { config } from "../config.ts";
import type { Obstacle } from "../types.ts";
import { hexToColor3 } from "./scene.ts";

export class Obstacles {
  private readonly scene: Scene;
  private readonly material: StandardMaterial;
  private readonly pool = new Map<number, Mesh>();

  constructor(scene: Scene) {
    this.scene = scene;
    this.material = new StandardMaterial("obstacleMat", scene);
    this.material.diffuseColor = hexToColor3(config.colors.accentMagenta).scale(
      config.spawner.obstacleDiffuseScale,
    );
    this.material.emissiveColor = hexToColor3(config.colors.accentMagenta);
    this.material.specularColor = Color3.White();
  }

  render(obstacles: Obstacle[]): void {
    const active = new Set<number>();

    for (const obstacle of obstacles) {
      active.add(obstacle.id);
      let mesh = this.pool.get(obstacle.id);
      if (mesh === undefined) {
        mesh = MeshBuilder.CreateBox(
          `obstacle-${obstacle.id}`,
          { width: obstacle.width, height: obstacle.height, depth: obstacle.depth },
          this.scene,
        );
        mesh.material = this.material;
        this.pool.set(obstacle.id, mesh);
      }
      mesh.position.x = obstacle.x;
      mesh.position.y = obstacle.height / 2;
      mesh.position.z = obstacle.z;
    }

    for (const [id, mesh] of this.pool) {
      if (!active.has(id)) {
        mesh.dispose();
        this.pool.delete(id);
      }
    }
  }

  clear(): void {
    for (const mesh of this.pool.values()) {
      mesh.dispose();
    }
    this.pool.clear();
  }

  dispose(): void {
    this.clear();
    this.material.dispose();
  }
}
