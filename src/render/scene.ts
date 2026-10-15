import {
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DirectionalLight,
  DynamicTexture,
  Engine,
  FreeCamera,
  GlowLayer,
  HemisphericLight,
  ParticleSystem,
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
  private readonly bloom: DefaultRenderingPipeline;
  private explosion: ParticleSystem | null = null;

  private cameraX = 0;
  private shakeRemaining = 0;
  private readonly shakeDuration = config.effects.shakeDurationMs / 1000;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { stencil: true }, true);
    this.scene = new Scene(this.engine);
    this.bgColor = hexToColor3(config.colors.bgVoid);

    this.scene.clearColor = new Color4(this.bgColor.r, this.bgColor.g, this.bgColor.b, 1);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogColor = this.bgColor;
    this.scene.fogDensity = config.scene.fogDensity;

    this.camera = new FreeCamera(
      "chaseCamera",
      new Vector3(0, config.camera.offsetY, config.camera.offsetZ),
      this.scene,
    );
    this.camera.setTarget(new Vector3(0, config.camera.lookAtY, config.camera.lookAtZ));
    this.camera.fov = this.fovRadians(config.camera.baseFovDeg);
    this.camera.minZ = config.scene.cameraMinZ;
    this.camera.maxZ = config.scene.cameraMaxZ;

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = config.scene.hemiLightIntensity;
    hemi.groundColor = this.bgColor;

    const dir = new DirectionalLight(
      "dir",
      new Vector3(
        config.scene.dirLightDirectionX,
        config.scene.dirLightDirectionY,
        config.scene.dirLightDirectionZ,
      ),
      this.scene,
    );
    dir.intensity = config.scene.dirLightIntensity;

    this.glow = new GlowLayer("glow", this.scene, {
      blurKernelSize: config.scene.glowBlurKernelSize,
    });
    this.glow.intensity = config.scene.glowIntensity;

    this.bloom = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
    this.bloom.bloomEnabled = true;
    this.bloom.bloomThreshold = config.scene.bloomThreshold;
    this.bloom.bloomWeight = config.scene.bloomWeight;

    window.addEventListener("resize", () => this.engine.resize());
  }

  private fovRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  updateCamera(playerX: number, deltaSeconds: number): void {
    const targetX = playerX * config.camera.offsetX;
    const t = Math.min(1, config.camera.followLerp * deltaSeconds);
    this.cameraX += (targetX - this.cameraX) * t;

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeRemaining > 0) {
      this.shakeRemaining = Math.max(0, this.shakeRemaining - deltaSeconds);
      const falloff = this.shakeRemaining / this.shakeDuration;
      const magnitude = config.effects.shakeMagnitude * falloff;
      shakeX = (Math.random() * 2 - 1) * magnitude;
      shakeY = (Math.random() * 2 - 1) * magnitude;
    }

    this.camera.position.set(
      this.cameraX + shakeX,
      config.camera.offsetY + shakeY,
      config.camera.offsetZ,
    );
    this.camera.setTarget(
      new Vector3(this.cameraX, config.camera.lookAtY, config.camera.lookAtZ),
    );
  }

  setSpeedFov(speedRatio: number): void {
    const clamped = Math.max(0, Math.min(1, speedRatio));
    const fovDeg =
      config.camera.baseFovDeg +
      (config.camera.maxFovDeg - config.camera.baseFovDeg) * clamped;
    this.camera.fov = this.fovRadians(fovDeg);
  }

  triggerShake(): void {
    this.shakeRemaining = this.shakeDuration;
  }

  burstExplosion(position: Vector3): void {
    const system = this.ensureExplosion();
    system.emitter = position.clone();
    system.manualEmitCount = config.effects.particleCountCrash;
  }

  private ensureExplosion(): ParticleSystem {
    if (this.explosion !== null) {
      return this.explosion;
    }

    const system = new ParticleSystem("crash", config.effects.particleCountCrash, this.scene);
    system.particleTexture = this.buildParticleTexture();
    system.emitter = Vector3.Zero();
    system.minEmitBox = new Vector3(
      -config.effects.particleEmitBox,
      -config.effects.particleEmitBox,
      -config.effects.particleEmitBox,
    );
    system.maxEmitBox = new Vector3(
      config.effects.particleEmitBox,
      config.effects.particleEmitBox,
      config.effects.particleEmitBox,
    );
    system.color1 = Color4.FromColor3(hexToColor3(config.colors.accentMagenta), 1);
    system.color2 = Color4.FromColor3(hexToColor3(config.colors.accentYellow), 1);
    system.colorDead = new Color4(0, 0, 0, 0);
    system.minSize = config.effects.particleMinSize;
    system.maxSize = config.effects.particleMaxSize;
    system.minLifeTime = config.effects.particleMinLifetime;
    system.maxLifeTime = config.effects.particleMaxLifetime;
    system.minEmitPower = config.effects.particleMinEmitPower;
    system.maxEmitPower = config.effects.particleMaxEmitPower;
    system.updateSpeed = config.effects.particleUpdateSpeed;
    system.gravity = new Vector3(0, config.effects.particleGravityY, 0);
    system.blendMode = ParticleSystem.BLENDMODE_ADD;
    system.emitRate = 0;
    system.disposeOnStop = false;
    system.createDirectedSphereEmitter(
      config.effects.particleDirectionSpread,
      new Vector3(-1, -1, -1),
      new Vector3(1, 1, 1),
    );
    system.start();

    this.explosion = system;
    return system;
  }

  private buildParticleTexture(): DynamicTexture {
    const size = config.effects.particleTextureSize;
    const texture = new DynamicTexture("particle", { width: size, height: size }, this.scene, false);
    texture.hasAlpha = true;
    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D;
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    texture.update();
    return texture;
  }

  render(): void {
    this.scene.render();
  }

  dispose(): void {
    this.explosion?.dispose();
    this.bloom.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
