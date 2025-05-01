import * as PIXI from "pixi.js";
import { Button } from "../components/Button";
import { publishEvent } from "../utils/event-system";
import { GameEventType } from "../types/events";

/**
 * Configuration for the menu scene
 */
export interface MenuSceneConfig {
  width: number;
  height: number;
}

/**
 * A container that displays the main menu scene
 */
export class MenuScene extends PIXI.Container {
  private buttonWidth = 200;
  private buttonHeight = 50;
  private buttonSpacing = 20;
  private startY = 300;

  private config: MenuSceneConfig;
  private buttons: Button[] = [];

  constructor(config: MenuSceneConfig) {
    super();
    this.config = config;
    this.init();
  }

  private init() {
    // New Game button

    const defaultButton = {
      width: this.buttonWidth,
      height: this.buttonHeight,
      textColor: 0xffffff,
      fontSize: 24,
      rounded: 10,
    };
    const buttons = [
      {
        text: "New Game",
        color: 0x4caf50,
        hoverColor: 0x66bb6a,
        downColor: 0x388e3c,
        onClicked: () => {
          publishEvent(GameEventType.MENU_NEW_GAME, {});
        },
      },
      {
        color: 0x2196f3, // Blue
        text: "Sandbox",
        hoverColor: 0x42a5f5,
        downColor: 0x1976d2,
        onClicked: () => {
          publishEvent(GameEventType.MENU_SANDBOX, {});
        },
      },
      {
        color: 0xff9800, // Orange
        text: "High Scores",
        hoverColor: 0xffb74d,
        downColor: 0xf57c00,
        onClicked: () => {
          publishEvent(GameEventType.MENU_HIGH_SCORES, {});
        },
      },
      {
        color: 0xf44336, // Red
        text: "Quit",
        hoverColor: 0xef5350,
        downColor: 0xd32f2f,
        onClicked: () => {
          publishEvent(GameEventType.MENU_HIGH_SCORES, {});
        },
      },
    ];

    this.buttons = [];
    let y = this.startY;
    for (const buttonConfig of buttons) {
      const button = new Button({
        ...defaultButton,
        ...buttonConfig,
      });
      button.position.set((this.config.width - this.buttonWidth) / 2, y);
      y += this.buttonHeight + this.buttonSpacing;
      this.buttons.push(button);
      this.addChild(button);
    }
  }

  /**
   * Show the menu scene
   */
  show() {
    this.visible = true;
  }

  /**
   * Hide the menu scene
   */
  hide() {
    this.visible = false;
  }

  public resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    let y = this.startY;
    for (const button of this.buttons) {
      button.position.set((this.config.width - this.buttonWidth) / 2, y);
      y += this.buttonHeight + this.buttonSpacing;
    }
  }
}
