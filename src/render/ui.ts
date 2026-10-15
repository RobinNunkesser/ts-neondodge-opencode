import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";
import type { Scene } from "@babylonjs/core";
import { config } from "../config.ts";

export class GameUI {
  private readonly ui: AdvancedDynamicTexture;
  private readonly scoreText: TextBlock;
  private readonly multiplierText: TextBlock;
  private readonly overlay: Rectangle;
  private readonly overlayTitle: TextBlock;
  private readonly overlayMessage: TextBlock;
  private readonly overlayHint: TextBlock;

  constructor(scene: Scene) {
    const u = config.ui;
    const c = config.colors;

    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("ui", true, scene);

    this.scoreText = new TextBlock("score", "0");
    this.scoreText.color = c.primaryCyan;
    this.scoreText.fontFamily = u.fontFamily;
    this.scoreText.fontSize = u.scoreFontSize;
    this.scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.scoreText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.scoreText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.scoreText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.scoreText.paddingLeft = `${u.padding}px`;
    this.scoreText.paddingTop = `${u.scorePaddingTop}px`;
    this.ui.addControl(this.scoreText);

    this.multiplierText = new TextBlock("multiplier", "");
    this.multiplierText.color = c.accentYellow;
    this.multiplierText.fontFamily = u.fontFamily;
    this.multiplierText.fontSize = u.multiplierFontSize;
    this.multiplierText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.multiplierText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.multiplierText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.multiplierText.paddingRight = `${u.padding}px`;
    this.multiplierText.paddingTop = `${u.multiplierPaddingTop}px`;
    this.ui.addControl(this.multiplierText);

    this.overlay = new Rectangle("overlay");
    this.overlay.width = "100%";
    this.overlay.height = "100%";
    this.overlay.thickness = 0;
    this.overlay.background = c.overlayBackground;
    this.ui.addControl(this.overlay);

    const panel = new StackPanel("overlayPanel");
    panel.spacing = u.panelSpacing;
    this.overlay.addControl(panel);

    this.overlayTitle = new TextBlock("overlayTitle", "NEON DODGE");
    this.overlayTitle.color = c.primaryCyan;
    this.overlayTitle.fontFamily = u.fontFamily;
    this.overlayTitle.fontSize = u.titleFontSize;
    panel.addControl(this.overlayTitle);

    this.overlayMessage = new TextBlock("overlayMessage", "");
    this.overlayMessage.color = c.accentMagenta;
    this.overlayMessage.fontFamily = u.fontFamily;
    this.overlayMessage.fontSize = u.messageFontSize;
    panel.addControl(this.overlayMessage);

    this.overlayHint = new TextBlock("overlayHint", "");
    this.overlayHint.color = c.text;
    this.overlayHint.fontFamily = u.fontFamily;
    this.overlayHint.fontSize = u.hintFontSize;
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
