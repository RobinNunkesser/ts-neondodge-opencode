import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import type { Scene } from "@babylonjs/core";
import { config } from "../config.ts";

const FONT = "Courier New, monospace";

export class GameUI {
  private readonly ui: AdvancedDynamicTexture;
  private readonly scoreText: TextBlock;
  private readonly multiplierText: TextBlock;
  private readonly overlay: Rectangle;
  private readonly overlayTitle: TextBlock;
  private readonly overlayMessage: TextBlock;
  private readonly overlayHint: TextBlock;

  constructor(scene: Scene) {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);

    this.scoreText = new TextBlock("score", "0");
    this.scoreText.color = config.colorPrimaryCyan;
    this.scoreText.fontFamily = FONT;
    this.scoreText.fontSize = 42;
    this.scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.scoreText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.scoreText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.scoreText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.scoreText.paddingLeft = "24px";
    this.scoreText.paddingTop = "18px";
    this.ui.addControl(this.scoreText);

    this.multiplierText = new TextBlock("multiplier", "");
    this.multiplierText.color = config.colorAccentYellow;
    this.multiplierText.fontFamily = FONT;
    this.multiplierText.fontSize = 22;
    this.multiplierText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.multiplierText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.multiplierText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.multiplierText.paddingRight = "24px";
    this.multiplierText.paddingTop = "26px";
    this.ui.addControl(this.multiplierText);

    this.overlay = new Rectangle("overlay");
    this.overlay.width = "100%";
    this.overlay.height = "100%";
    this.overlay.thickness = 0;
    this.overlay.background = "rgba(8, 7, 16, 0.72)";
    this.ui.addControl(this.overlay);

    const panel = new StackPanel("overlayPanel");
    panel.spacing = 18;
    this.overlay.addControl(panel);

    this.overlayTitle = new TextBlock("overlayTitle", "NEON DODGE");
    this.overlayTitle.color = config.colorPrimaryCyan;
    this.overlayTitle.fontFamily = FONT;
    this.overlayTitle.fontSize = 72;
    panel.addControl(this.overlayTitle);

    this.overlayMessage = new TextBlock("overlayMessage", "");
    this.overlayMessage.color = config.colorAccentMagenta;
    this.overlayMessage.fontFamily = FONT;
    this.overlayMessage.fontSize = 30;
    panel.addControl(this.overlayMessage);

    this.overlayHint = new TextBlock("overlayHint", "");
    this.overlayHint.color = "#ffffff";
    this.overlayHint.fontFamily = FONT;
    this.overlayHint.fontSize = 24;
    panel.addControl(this.overlayHint);

    this.showMenu(0);
  }

  setScore(score: number): void {
    this.scoreText.text = String(score);
  }

  setMultiplier(multiplier: number, nearMisses: number): void {
    const parts = [`${multiplier.toFixed(1)}x`];
    if (nearMisses > 0) {
      parts.push(`NEAR MISS x${nearMisses}`);
    }
    this.multiplierText.text = parts.join("   ");
  }

  private hideOverlay(): void {
    this.overlay.isVisible = false;
  }

  private showOverlay(title: string, message: string, hint: string): void {
    this.overlayTitle.text = title;
    this.overlayMessage.text = message;
    this.overlayHint.text = hint;
    this.overlay.isVisible = true;
  }

  showMenu(highscore: number): void {
    this.showOverlay(
      "NEON DODGE",
      `HIGHSCORE  ${highscore}`,
      "PRESS SPACE / TAP TO START",
    );
  }

  showPlaying(): void {
    this.hideOverlay();
  }

  showPaused(): void {
    this.showOverlay("PAUSED", "", "PRESS ESC / P TO RESUME");
  }

  showGameOver(score: number, best: number, isNewHighscore: boolean): void {
    const message = isNewHighscore ? `NEW HIGHSCORE!  ${score}` : `SCORE  ${score}   BEST  ${best}`;
    this.showOverlay("GAME OVER", message, "PRESS SPACE / TAP TO RETRY");
  }

  dispose(): void {
    this.ui.dispose();
  }
}
