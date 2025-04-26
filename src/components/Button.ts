import * as PIXI from 'pixi.js';


/**
 * Configuration for the combination icon
 */
export interface ButtonConfig {
  width: number;
  height: number;
  color: number;
  text: string;
  textColor: number;
  fontFamily: string;
  fontSize: number;
  rounded: number;
  hoverColor: number;
  downColor: number;
  disabledColor: number;

  onClicked?: () => void
}

const DEFAULT_CONFIG: ButtonConfig = {
    width: 100,
    height: 30,
    color: 0xFF0000,
    text: 'button',
    textColor: 0xFFFFFF,
    fontFamily: '"Gill Sans", sans-serif',
    fontSize: 16,
    rounded: 5,
    hoverColor: 0xff3030,
    downColor: 0xd40404,
    disabledColor: 0x333333,
};

/**
 * A container that displays a visual representation of a winning pattern
 */
export class Button extends PIXI.Container {

    private config: ButtonConfig;

    constructor(config: Partial<ButtonConfig> = {}) {
        super()
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.init()
    }

    private init() {
        const container = new PIXI.Container();
        container.setSize(this.config.width, this.config.height);
        // Create background
        const background = new PIXI.Graphics()
            .roundRect(0, 0, this.config.width, this.config.height, this.config.rounded)
            .fill(this.config.color);
        container.addChild(background);
        
        // Create text
        const text = new PIXI.Text({
            text: this.config.text,
            style: {
                fontFamily: this.config.fontFamily,
                fontSize: this.config.fontSize,
                fill: this.config.textColor,
            },
            align: 'center'
        } as PIXI.TextOptions);
        text.anchor.set(0.5);
        text.position.set(this.config.width/2, this.config.height/2);
        container.addChild(text);
        
        // Set up interactivity
        container.eventMode = 'static';
        container.cursor = 'pointer';
        
        // Add event listeners
        container.on('pointerdown', () => {
            background.tint = this.config.downColor; // Darker blue when pressed
        });
        
        container.on('pointerup', () => {
            background.tint = this.config.color; // Back to normal blue
            this.onClicked();
        });
        
        container.on('pointerupoutside', () => {
            background.tint = this.config.color; // Back to normal blue
        });
        
        container.on('pointerover', () => {
            background.tint = this.config.hoverColor; // Lighter blue when hovered
        });
        
        container.on('pointerout', () => {
            background.tint = this.config.color; // Back to normal blue
        });
        this.addChild(container);
            
    }

    private onClicked()
    {
        if (this.config.onClicked) {
            this.config.onClicked();
        }
    }

}