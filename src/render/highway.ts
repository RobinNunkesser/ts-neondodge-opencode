import {
  Color3,
  DynamicTexture,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { config } from "../config.ts";
import { hexToColor3 } from "./scene.ts";

export class Highway {
  private readonly road: Mesh;
  private readonly rails: Mesh[];
  private readonly texture: DynamicTexture;

  constructor(scene: Scene) {
    this.texture = this.buildGridTexture(scene);

    const h = config.highway;
    const roadLength = config.gameplay.roadLength + h.extraLength;
    this.road = MeshBuilder.CreateGround(
      "highway",
      { width: config.gameplay.roadWidth, height: roadLength },
      scene,
    );
    this.road.position.z = roadLength / 2 - h.startOffset;

    const material = new StandardMaterial("highwayMat", scene);
    material.diffuseColor = Color3.Black();
    material.specularColor = Color3.Black();
    material.emissiveColor = Color3.White();
    material.emissiveTexture = this.texture;
    material.disableLighting = true;
    this.road.material = material;

    const railMaterial = new StandardMaterial("railMat", scene);
    railMaterial.diffuseColor = Color3.Black();
    railMaterial.emissiveColor = hexToColor3(config.colors.primaryCyan);
    railMaterial.disableLighting = true;

    this.rails = [-1, 1].map((side) => {
      const rail = MeshBuilder.CreateBox(
        `rail${side}`,
        { width: h.railWidth, height: h.railHeight, depth: roadLength },
        scene,
      );
      rail.position = new Vector3(
        (side * config.gameplay.roadWidth) / 2,
        h.railY,
        roadLength / 2 - h.startOffset,
      );
      rail.material = railMaterial;
      return rail;
    });
  }

  private buildGridTexture(scene: Scene): DynamicTexture {
    const h = config.highway;
    const width = h.textureWidth;
    const height = h.textureHeight;

    const texture = new DynamicTexture("grid", { width, height }, scene, true);
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;

    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = config.colors.bgVoid;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = config.colors.primaryCyan;
    ctx.lineWidth = h.laneLineWidth;
    ctx.globalAlpha = h.laneLineAlpha;

    for (let i = 0; i <= config.gameplay.laneCount; i += 1) {
      const x = (width / config.gameplay.laneCount) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const rungStep = height / h.rungs;
    ctx.lineWidth = h.rungLineWidth;
    ctx.globalAlpha = h.rungAlpha;
    for (let i = 0; i < h.rungs; i += 1) {
      const y = i * rungStep;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    texture.update();
    return texture;
  }

  update(deltaSeconds: number, speed: number): void {
    this.texture.vOffset += (speed / config.gameplay.roadLength) * deltaSeconds;
  }

  dispose(): void {
    this.road.dispose();
    this.texture.dispose();
    for (const rail of this.rails) {
      rail.dispose();
    }
  }
}
