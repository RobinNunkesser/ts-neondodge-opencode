import {
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  FreeCamera,
  GlowLayer,
  HemisphericLight,
  Scene,
  Vector3,
} from "@babylonjs/core";
import { config } from "../config.ts";

export function hexToColor3(hex: string): Color3 {
  return Color3.FromHexString(hex);
}

export class GameScene {
  readonly engine: Engine;
  readonly scene: Scene;
  readonly camera: FreeCamera;
  readonly glow: GlowLayer;

  private readonly bgColor: Color3;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { stencil: true }, true);
    this.scene = new Scene(this.engine);
    this.bgColor = hexToColor3(config.colorBgVoid);

    this.scene.clearColor = new Color4(this.bgColor.r, this.bgColor.g, this.bgColor.b, 1);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogColor = this.bgColor;
    this.scene.fogDensity = 0.012;

    this.camera = new FreeCamera(
      "chaseCamera",
      new Vector3(0, config.cameraOffsetY, config.cameraOffsetZ),
      this.scene,
    );
    this.camera.setTarget(new Vector3(0, 0, config.cameraLookAtZ));
    this.camera.fov = (config.cameraBaseFovDeg * Math.PI) / 180;
    this.camera.minZ = 0.1;
    this.camera.maxZ = 400;

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.4;
    hemi.groundColor = this.bgColor;

    const dir = new DirectionalLight("dir", new Vector3(-0.3, -1, 1), this.scene);
    dir.intensity = 0.6;

    this.glow = new GlowLayer("glow", this.scene, {
      blurKernelSize: 32,
    });
    this.glow.intensity = config.glowIntensity;

    window.addEventListener("resize", () => this.engine.resize());
  }

  updateCamera(playerX: number, deltaSeconds: number): void {
    const targetX = playerX * config.cameraOffsetX;
    const t = Math.min(1, config.cameraFollowLerp * deltaSeconds);
    this.camera.position.x += (targetX - this.camera.position.x) * t;
    this.camera.position.y = config.cameraOffsetY;
    this.camera.position.z = config.cameraOffsetZ;
    this.camera.setTarget(new Vector3(this.camera.position.x, 0, config.cameraLookAtZ));
  }

  setSpeedFov(speedRatio: number): void {
    const clamped = Math.max(0, Math.min(1, speedRatio));
    const fovDeg = config.cameraBaseFovDeg + (config.cameraMaxFovDeg - config.cameraBaseFovDeg) * clamped;
    this.camera.fov = (fovDeg * Math.PI) / 180;
  }

  render(): void {
    this.scene.render();
  }

  dispose(): void {
    this.scene.dispose();
    this.engine.dispose();
  }
}
