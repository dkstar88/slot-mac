import * as PIXI from 'pixi.js';
import { MAIN_CONFIG } from '../config';
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
        
      const boardWidth = MAIN_CONFIG.board.width + 30;
      const boardHeight = MAIN_CONFIG.board.height;
        // Create background
    
      const background = new PIXI.Sprite(PIXI.Assets.get('background'));
      background.position.set(0, 0);
      background.width = this.config.width;
      background.height = this.config.height;
      this.addChild(background);
  
      // const slotFrame = new PIXI.Sprite(PIXI.Assets.get('slots'));
      // slotFrame.position.set(
      //   this.config.width/2 - boardWidth/2-4, 
      //   this.config.height/2 - boardHeight/2 + MAIN_CONFIG.board.y);
      // slotFrame.width = boardWidth;
      // slotFrame.height = boardHeight;
      // this.addChild(slotFrame);
    }

}