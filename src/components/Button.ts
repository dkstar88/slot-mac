import * as PIXI from 'pixi.js';


/**
 * Configuration for the button
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
  highlightStrength: number; // 0-1 value for highlight intensity
  shadowStrength: number; // 0-1 value for shadow intensity
  shadowDistance: number; // Distance of shadow in pixels

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
    highlightStrength: 0.3, // 30% lighter for highlight
    shadowStrength: 0.3, // 30% darker for shadow
    shadowDistance: 3, // 3px shadow offset
};

/**
 * A button component with realistic highlight and shadow effects
 */
export class Button extends PIXI.Container {

    protected config: ButtonConfig;
    private normalBackground!: PIXI.Container;
    private hoverBackground!: PIXI.Container;
    private downBackground!: PIXI.Container;

    constructor(config: Partial<ButtonConfig> = {}) {
        super()
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.init()
    }

    /**
     * Adjusts a color to be lighter or darker by a percentage
     * @param color The base color in hex format (0xRRGGBB)
     * @param percent Positive for lighter, negative for darker
     * @returns The adjusted color
     */
    private adjustColor(color: number, percent: number): number {
        // Extract RGB components
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        
        // Adjust each component
        const adjustR = Math.min(255, Math.max(0, Math.round(r + (255 * percent))));
        const adjustG = Math.min(255, Math.max(0, Math.round(g + (255 * percent))));
        const adjustB = Math.min(255, Math.max(0, Math.round(b + (255 * percent))));
        
        // Recombine into a single color
        return (adjustR << 16) | (adjustG << 8) | adjustB;
    }

    private createBackground(color: number): PIXI.Container
    {

        const highlightColor = this.adjustColor(color, this.config.highlightStrength);
        const shadowColor = this.adjustColor(color, -this.config.shadowStrength);
                
        const background = new PIXI.Graphics();

        // Create shadow (placed behind and slightly offset)
        background.roundRect(
            this.config.shadowDistance, 
            this.config.shadowDistance, 
            this.config.width, 
            this.config.height, 
            this.config.rounded
        )
        .fill(shadowColor);
        
        background.roundRect(0, 0, this.config.width, this.config.height, this.config.rounded)
            .fill(this.config.color);
        
        // Create highlight (top part of the button)
        background.roundRect(0, 0, this.config.width, this.config.height / 2, this.config.rounded)
            .fill(highlightColor);
        
        return background;
    }


    private init() {
        const container = new PIXI.Container();
        container.setSize(this.config.width, this.config.height);

        this.normalBackground = this.createBackground(this.config.color);
        this.hoverBackground = this.createBackground(this.config.hoverColor);
        this.downBackground = this.createBackground(this.config.downColor);
        
        this.addChild(this.normalBackground);

            // Apply a mask to the highlight so it only shows on the button
        const highlightMask = new PIXI.Graphics()
        .roundRect(0, 0, this.config.width, this.config.height, this.config.rounded)
        .fill(0xFFFFFF);
        this.addChild(highlightMask);
        this.mask = highlightMask;
            
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
        this.eventMode = 'static';
        this.cursor = 'pointer';
        
        // Add event listeners
        this.on('pointerdown', () => {
            this.setBackground(this.downBackground);
            text.position.set(this.config.width/2 + 1, this.config.height/2 + 1);
        });
        
        this.on('pointerup', () => {
            this.setBackground(this.normalBackground);
            text.position.set(this.config.width/2, this.config.height/2);
            this.onClicked();
        });
        
        this.on('pointerupoutside', () => {
            this.setBackground(this.normalBackground);
            text.position.set(this.config.width/2, this.config.height/2);
        });
        
        this.on('pointerover', () => {
            this.setBackground(this.hoverBackground);
        });
        
        this.on('pointerout', () => {
            this.setBackground(this.normalBackground);
        });
        this.addChild(container);
            
    }

    private setBackground(background: PIXI.Container)
    {
        this.removeChildAt(0);
        this.addChildAt(background, 0)        
    }

    private onClicked()
    {
        if (this.config.onClicked) {
            this.config.onClicked();
        }
    }
    
    /**
     * Enable the button
     */
    public enable(): void {
        // Enable interactivity
        this.eventMode = 'static';
        this.cursor = 'pointer';
    }
    
    /**
     * Disable the button
     */
    public disable(): void {
        // Disable interactivity
        this.eventMode = 'none';
        this.cursor = 'default';
    }

}
