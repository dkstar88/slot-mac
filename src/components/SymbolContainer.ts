import * as PIXI from 'pixi.js';
import { SymbolType } from '../types/symbols';

/**
 * Configuration for the game UI
 */
export interface SymbolContainerConfig {
    size: number;
    symbol: SymbolType;
}

const DEFAULT_CONFIG: SymbolContainerConfig = {
    size: 100,
    symbol: SymbolType.CHERRY,
};

export class SymbolContainer extends PIXI.Container {
 
    private config: SymbolContainerConfig;
    private symbolSprite!: PIXI.Sprite;
    private symbolText!: PIXI.Text;
    private highlight!: PIXI.Graphics;
    private isHighlighted: boolean = false;

    constructor(config: Partial<SymbolContainerConfig> = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Initialize UI elements
        this.initUI();

    }

    private createSymbolSprite() {
        const sprite = new PIXI.Sprite(PIXI.Assets.get(this.config.symbol));
      
        // Scale the sprite to fit within the symbol size
        const padding = 10;
        const maxSize = this.config.size - (padding * 2);
        
        // Calculate scale to fit within the maxSize while maintaining aspect ratio
        const scale = Math.min(
          maxSize / sprite.width,
          maxSize / sprite.height
        );
        
        sprite.scale.set(scale, scale);
        
        // Center the sprite in the container
        sprite.anchor.set(0.5);
        sprite.position.set(this.config.size / 2, this.config.size / 2);

        return sprite;
    }

    private initUI() {
        // Create symbol sprite
        this.symbolSprite = this.createSymbolSprite();
        this.addChild(this.symbolSprite);

        this.symbolText = new PIXI.Text({
        text: '',
        style:{
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0x000000,
            align: 'center'  
        }
        });
        this.symbolText.anchor.set(0, 0);
        this.addChild(this.symbolText);

        this.highlight = new PIXI.Graphics()
          .setStrokeStyle({
            width: 2, color: 0xffff00, alpha: 1,
          })
          .rect(0, 0, this.config.size, this.config.size)
          .fill(
            {
              color: 0xffff00, alpha: 0.5,
            }
          );

        this.highlight.label = 'highlight';
        this.highlight.visible = false;
        this.addChild(this.highlight);
       

    }

    public setIsHighlighted(isHighlighted: boolean) {
        this.isHighlighted = isHighlighted;
        this.highlight.visible = isHighlighted;
    }

    public getIsHighlighted() {
        return this.isHighlighted;
    }

    public setSymbol(symbol: SymbolType) {
        this.config.symbol = symbol;
        this.symbolSprite.texture = PIXI.Assets.get(symbol);
    }
    
    public setText(text: string) {
        this.symbolText.text = text;
        
    }
    
    public getSymbol() {
        return this.config.symbol;
    }

}