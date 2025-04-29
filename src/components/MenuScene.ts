import * as PIXI from 'pixi.js';
import { Button } from './Button';
import { publishEvent } from '../utils/event-system';
import { GameEventType } from '../types/events';
import { MAIN_CONFIG } from '../config';

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
  private config: MenuSceneConfig;
  private title!: PIXI.Text;
  private buttons!: {
    newGame: Button;
    sandbox: Button;
    highScores: Button;
    quit: Button;
  };

  constructor(config: MenuSceneConfig) {
    super();
    this.config = config;
    this.init();
  }

  private init() {
    // Create title
    // this.title = new PIXI.Text('Fruitful Fortune', {
    //   fontFamily: '"Gill Sans", sans-serif',
    //   fontSize: 48,
    //   fill: 0xFFFFFF,
    //   align: 'center'
    // });
    // this.title.anchor.set(0.5);
    // this.title.position.set(this.config.width / 2, 150);
    // this.addChild(this.title);

    // Create buttons
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    const startY = 300;

    // New Game button
    this.buttons = {
      newGame: new Button({
        width: buttonWidth,
        height: buttonHeight,
        color: 0x4CAF50, // Green
        text: 'New Game',
        textColor: 0xFFFFFF,
        fontSize: 24,
        rounded: 10,
        hoverColor: 0x66BB6A,
        downColor: 0x388E3C,
        onClicked: () => {
          publishEvent(GameEventType.MENU_NEW_GAME, {});
        }
      }),
      sandbox: new Button({
        width: buttonWidth,
        height: buttonHeight,
        color: 0x2196F3, // Blue
        text: 'Sandbox',
        textColor: 0xFFFFFF,
        fontSize: 24,
        rounded: 10,
        hoverColor: 0x42A5F5,
        downColor: 0x1976D2,
        onClicked: () => {
          publishEvent(GameEventType.MENU_SANDBOX, {});
        }
      }),
      highScores: new Button({
        width: buttonWidth,
        height: buttonHeight,
        color: 0xFF9800, // Orange
        text: 'High Scores',
        textColor: 0xFFFFFF,
        fontSize: 24,
        rounded: 10,
        hoverColor: 0xFFB74D,
        downColor: 0xF57C00,
        onClicked: () => {
          publishEvent(GameEventType.MENU_HIGH_SCORES, {});
        }
      }),
      quit: new Button({
        width: buttonWidth,
        height: buttonHeight,
        color: 0xF44336, // Red
        text: 'Quit',
        textColor: 0xFFFFFF,
        fontSize: 24,
        rounded: 10,
        hoverColor: 0xEF5350,
        downColor: 0xD32F2F,
        onClicked: () => {
          publishEvent(GameEventType.MENU_QUIT, {});
        }
      })
    };

    // Position buttons
    this.buttons.newGame.position.set(
      (this.config.width - buttonWidth) / 2,
      startY
    );
    this.buttons.sandbox.position.set(
      (this.config.width - buttonWidth) / 2,
      startY + buttonHeight + buttonSpacing
    );
    this.buttons.highScores.position.set(
      (this.config.width - buttonWidth) / 2,
      startY + (buttonHeight + buttonSpacing) * 2
    );
    this.buttons.quit.position.set(
      (this.config.width - buttonWidth) / 2,
      startY + (buttonHeight + buttonSpacing) * 3
    );

    // Add buttons to container
    this.addChild(
      this.buttons.newGame,
      this.buttons.sandbox,
      this.buttons.highScores,
      this.buttons.quit
    );
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
}
