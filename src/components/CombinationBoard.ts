import * as PIXI from "pixi.js";
import { GlyphType } from "../types/glyphs";
import { WinningPatternsManager } from "../core/winning-patterns";
import { CombinationIcon } from "./CombinationIcon";
/**
 * Configuration for the combination icon
 */
export interface CombinationBoardConfig {
  width: number;
  height: number;
  color: number;
  textColor: number;
  fontFamily: string;
  fontSize: number;
}

const DEFAULT_CONFIG: CombinationBoardConfig = {
  width: 100,
  height: 30,
  color: 0xff0000,
  textColor: 0xffffff,
  fontFamily: '"Gill Sans", sans-serif',
  fontSize: 14,
};

export class CombinationBoard extends PIXI.Container {
  private config: CombinationBoardConfig;

  constructor(config: Partial<CombinationBoardConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.init();
  }

  private init() {
    // Add title

    const background = new PIXI.Graphics()
      .roundRect(0, 0, this.config.width, this.config.height, 5)
      .fill({ color: this.config.color, alpha: 0.6 });
    this.addChild(background);

    const title = new PIXI.Text({
      text: "Winning Patterns",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
        fontWeight: "bold",
      },
    } as PIXI.TextOptions);
    title.position.set(10, 2);
    this.addChild(title);

    // Get unique patterns (some patterns like THREE_DIAGONAL appear twice with different matrices)
    const uniquePatterns = new Map();
    WinningPatternsManager.getWinningPatterns().forEach((pattern) => {
      if (!uniquePatterns.has(pattern.type)) {
        uniquePatterns.set(pattern.type, pattern);
      }
    });

    // Create a display for each pattern
    let yOffset = 30;
    const iconSize = 55;
    const glyphSize = 10;
    const spacing = 5;

    uniquePatterns.forEach((pattern) => {
      // Create container for this pattern
      const patternContainer = new PIXI.Container();
      patternContainer.position.set(10, yOffset);

      // Create combination icon
      const combinationIcon = new CombinationIcon({
        size: iconSize,
        glyphSize: glyphSize,
        pattern: pattern.type,
        glyphType: GlyphType.CHERRY,
      });
      combinationIcon.scale.set(0.8);
      patternContainer.addChild(combinationIcon);

      // Create pattern name text
      const nameText = new PIXI.Text({
        text: pattern.name,
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.fontSize * 0.8,
          fill: this.config.textColor,
        },
      } as PIXI.TextOptions);
      nameText.position.set(combinationIcon.width + spacing, 2);
      patternContainer.addChild(nameText);

      // Create multiplier text
      const multiplierText = new PIXI.Text({
        text: `x ${pattern.multiplier}`,
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.fontSize * 0.8,
          fill: 0xffcc00,
          fontWeight: "bold",
        },
      } as PIXI.TextOptions);
      multiplierText.position.set(
        combinationIcon.width + spacing,
        nameText.y + nameText.height,
      );
      patternContainer.addChild(multiplierText);

      // Add pattern container to combinations container
      this.addChild(patternContainer);

      // Update yOffset for next pattern
      yOffset +=
        Math.max(
          combinationIcon.height,
          nameText.height + multiplierText.height + 5,
        ) + spacing;
    });
  }
}
