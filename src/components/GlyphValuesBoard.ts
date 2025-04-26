import * as PIXI from 'pixi.js';
import { GLYPHS_ARRAY, GlyphManager } from '../core/glyphs';

/**
 * Configuration for the combination icon
 */
export interface GlyphValuesBoardConfig {
  width: number;
  height: number;
  color: number;
  textColor: number;
  fontFamily: string;
  fontSize: number;
}

const DEFAULT_CONFIG: GlyphValuesBoardConfig = {
    width: 100,
    height: 30,
    color: 0xFF0000,
    textColor: 0xFFFFFF,
    fontFamily: '"Gill Sans", sans-serif',
    fontSize: 14,    
};

export class GlyphValuesBoard extends PIXI.Container {

    private config: GlyphValuesBoardConfig;

    constructor(config: Partial<GlyphValuesBoardConfig> = {}) {
        super()
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.init()
    }

    private init() {

        const background = new PIXI.Graphics()
            .roundRect(0, 0, this.config.width, this.config.height, 5)
            .fill({ color: this.config.color, alpha: 0.6 });
        this.addChild(background);
        
        // Add title
        const title = new PIXI.Text({
            text: 'Values',
            style: {
            fontFamily: this.config.fontFamily,
            fontSize: this.config.fontSize,
            fill: this.config.textColor,
            fontWeight: 'bold'
            }
        } as PIXI.TextOptions);
        this.addChild(title);
        
        // Create grid of symbols
        GLYPHS_ARRAY.forEach((symbol, index) => {
            const yPos = 30 + (index * 35);
                
            // Create value text
            const valueText = new PIXI.Text({
            text: `${symbol.emoji}  ${symbol.payoutValue}   ` + GlyphManager.getGlyphWeightPercentage(symbol.type).toFixed(2) + '%',
            style: {
                fontFamily: this.config.fontFamily,
                fontSize: this.config.fontSize,
                fill: this.config.textColor
            }
            } as PIXI.TextOptions);
            valueText.position.set(1, yPos);
            this.addChild(valueText);
        });
            
    }

}