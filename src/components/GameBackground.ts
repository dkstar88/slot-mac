import * as PIXI from "pixi.js";
import { MAIN_CONFIG } from "../config";
/**
 * Configuration for the game UI
 */
export interface GameBackgroundConfig {
  /** Width of the UI */
  width: number;

  /** Height of the UI */
  height: number;
}

const DEFAULT_CONFIG: GameBackgroundConfig = {
  width: MAIN_CONFIG.width,
  height: MAIN_CONFIG.height,
};

export class GameBackground extends PIXI.Container {
  private config: GameBackgroundConfig;

  constructor(config: Partial<GameBackgroundConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    // Initialize UI elements
    this.initUI();
  }

  private initUI() {
    // Create background

    const background = new PIXI.Sprite(PIXI.Assets.get("background"));
    background.anchor.set(0, 0);
    background.setSize(this.config.width, this.config.height);
    this.addChild(background);

    const logo = new PIXI.Sprite(PIXI.Assets.get("logo"));
    logo.position.set((this.config.width - logo.width) / 2, 100);
    this.addChild(logo);
  }
}
