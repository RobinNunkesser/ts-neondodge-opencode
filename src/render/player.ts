import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { config } from "../config.ts";
import { hexToColor3 } from "./scene.ts";

export class Player {
  private readonly root: TransformNode;
  private readonly meshes: Mesh[] = [];
  private bobTime = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("player", scene);

    const bodyMaterial = new StandardMaterial("playerBody", scene);
    bodyMaterial.diffuseColor = hexToColor3(config.colorPrimaryCyan);
    bodyMaterial.emissiveColor = hexToColor3(config.colorPrimaryCyan).scale(0.6);
    bodyMaterial.specularColor = Color3.White();

    const hull = MeshBuilder.CreateBox(
      "hull",
      { width: config.playerWidth, height: config.playerHeight * 0.5, depth: config.playerDepth },
      scene,
    );
    hull.material = bodyMaterial;
    hull.parent = this.root;
    this.meshes.push(hull);

    const nose = MeshBuilder.CreateCylinder(
      "nose",
      {
        height: config.playerDepth * 0.7,
        diameterTop: 0.1,
        diameterBottom: config.playerWidth * 0.9,
        tessellation: 4,
      },
      scene,
    );
    nose.rotation.x = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.z = config.playerDepth * 0.7;
    nose.material = bodyMaterial;
    nose.parent = this.root;
    this.meshes.push(nose);

    const finMaterial = new StandardMaterial("playerFin", scene);
    finMaterial.diffuseColor = Color3.Black();
    finMaterial.emissiveColor = hexToColor3(config.colorAccentMagenta).scale(0.8);
    finMaterial.disableLighting = true;

    for (const side of [-1, 1]) {
      const fin = MeshBuilder.CreateBox(
        `fin${side}`,
        { width: 0.2, height: config.playerHeight * 0.7, depth: config.playerDepth * 0.5 },
        scene,
      );
      fin.position = new Vector3((side * config.playerWidth) / 2, 0, -config.playerDepth * 0.25);
      fin.material = finMaterial;
      fin.parent = this.root;
      this.meshes.push(fin);
    }

    this.root.position = new Vector3(0, config.playerY, 0);
  }

  update(x: number, tilt: number, deltaSeconds: number): void {
    this.bobTime += deltaSeconds;
    this.root.position.x = x;
    this.root.position.y =
      config.playerY + Math.sin(this.bobTime * config.playerBobSpeed) * config.playerBobAmplitude;
    this.root.rotation.z = tilt;
  }

  get node(): TransformNode {
    return this.root;
  }

  setVisible(visible: boolean): void {
    this.root.setEnabled(visible);
  }

  dispose(): void {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    this.root.dispose();
  }
}
