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

const TEXTURE_WIDTH = 256;
const TEXTURE_HEIGHT = 2048;
const RUNGS = 32;

export class Highway {
  private readonly road: Mesh;
  private readonly rails: Mesh[];
  private readonly texture: DynamicTexture;

  constructor(scene: Scene) {
    this.texture = this.buildGridTexture(scene);

    const roadLength = config.roadLength + 60;
    this.road = MeshBuilder.CreateGround(
      "highway",
      { width: config.roadWidth, height: roadLength },
      scene,
    );
    this.road.position.z = roadLength / 2 - 30;

    const material = new StandardMaterial("highwayMat", scene);
    material.diffuseColor = Color3.Black();
    material.specularColor = Color3.Black();
    material.emissiveColor = Color3.White();
    material.emissiveTexture = this.texture;
    material.disableLighting = true;
    this.road.material = material;

    const railMaterial = new StandardMaterial("railMat", scene);
    railMaterial.diffuseColor = Color3.Black();
    railMaterial.emissiveColor = hexToColor3(config.colorPrimaryCyan);
    railMaterial.disableLighting = true;

    const railLength = config.roadLength + 60;
    this.rails = [-1, 1].map((side) => {
      const rail = MeshBuilder.CreateBox(
        `rail${side}`,
        { width: 0.25, height: 0.4, depth: railLength },
        scene,
      );
      rail.position = new Vector3(
        (side * config.roadWidth) / 2,
        0.2,
        railLength / 2 - 30,
      );
      rail.material = railMaterial;
      return rail;
    });
  }

  private buildGridTexture(scene: Scene): DynamicTexture {
    const texture = new DynamicTexture(
      "grid",
      { width: TEXTURE_WIDTH, height: TEXTURE_HEIGHT },
      scene,
      true,
    );
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.WRAP_ADDRESSMODE;

    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;
    const bg = config.colorBgVoid;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

    ctx.strokeStyle = config.colorPrimaryCyan;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55;

    for (let i = 0; i <= config.laneCount; i += 1) {
      const x = (TEXTURE_WIDTH / config.laneCount) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, TEXTURE_HEIGHT);
      ctx.stroke();
    }

    const rungStep = TEXTURE_HEIGHT / RUNGS;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < RUNGS; i += 1) {
      const y = i * rungStep;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(TEXTURE_WIDTH, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    texture.update();
    return texture;
  }

  update(deltaSeconds: number, speed: number): void {
    this.texture.vOffset += (speed / config.roadLength) * deltaSeconds;
  }

  dispose(): void {
    this.road.dispose();
    this.texture.dispose();
    for (const rail of this.rails) {
      rail.dispose();
    }
  }
}
