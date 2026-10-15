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
    const p = config.player;
    this.root = new TransformNode("player", scene);

    const bodyMaterial = new StandardMaterial("playerBody", scene);
    bodyMaterial.diffuseColor = hexToColor3(config.colors.primaryCyan);
    bodyMaterial.emissiveColor = hexToColor3(config.colors.primaryCyan).scale(p.emissiveScale);
    bodyMaterial.specularColor = Color3.White();

    const hull = MeshBuilder.CreateBox(
      "hull",
      { width: p.width, height: p.height * p.hullHeightFactor, depth: p.depth },
      scene,
    );
    hull.material = bodyMaterial;
    hull.parent = this.root;
    this.meshes.push(hull);

    const nose = MeshBuilder.CreateCylinder(
      "nose",
      {
        height: p.depth * p.noseHeightFactor,
        diameterTop: p.noseTipDiameter,
        diameterBottom: p.width * p.noseBaseFactor,
        tessellation: p.noseTessellation,
      },
      scene,
    );
    nose.rotation.x = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.z = p.depth * p.noseHeightFactor;
    nose.material = bodyMaterial;
    nose.parent = this.root;
    this.meshes.push(nose);

    const finMaterial = new StandardMaterial("playerFin", scene);
    finMaterial.diffuseColor = Color3.Black();
    finMaterial.emissiveColor = hexToColor3(config.colors.accentMagenta).scale(p.finEmissiveScale);
    finMaterial.disableLighting = true;

    for (const side of [-1, 1]) {
      const fin = MeshBuilder.CreateBox(
        `fin${side}`,
        { width: p.finWidth, height: p.height * p.finHeightFactor, depth: p.depth * p.finDepthFactor },
        scene,
      );
      fin.position = new Vector3((side * p.width) / 2, 0, p.depth * p.finZFactor);
      fin.material = finMaterial;
      fin.parent = this.root;
      this.meshes.push(fin);
    }

    this.root.position = new Vector3(0, p.y, 0);
  }

  update(x: number, tilt: number, deltaSeconds: number): void {
    const p = config.player;
    this.bobTime += deltaSeconds;
    this.root.position.x = x;
    this.root.position.y = p.y + Math.sin(this.bobTime * p.bobSpeed) * p.bobAmplitude;
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
