import * as PIXI from 'pixi.js';

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
  width: 800,
  height: 600,
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
    
        const background = new PIXI.Sprite(PIXI.Assets.get('background'));
        background.position.set(0, 0);
        background.width = this.config.width;
        background.height = this.config.height;
        this.addChild(background);
    
        const slotFrame = new PIXI.Sprite(PIXI.Assets.get('slots'));
        slotFrame.position.set(100, 130);
        slotFrame.width = this.config.width - 215;
        slotFrame.height = this.config.height - 260;
        this.addChild(slotFrame);
    }

}