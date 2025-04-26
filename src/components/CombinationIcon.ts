import * as PIXI from 'pixi.js';
import { WinCombinationType } from '../types/winning-combinations';
import { GlyphType } from '../types/glyphs';

/**
 * Configuration for the combination icon
 */
export interface CombinationIconConfig {
    size: number;
    glyphSize: number;
    pattern: WinCombinationType;
    glyphType?: GlyphType;
}

const DEFAULT_CONFIG: CombinationIconConfig = {
    size: 100,
    glyphSize: 20,
    pattern: WinCombinationType.THREE_ACROSS,
    glyphType: GlyphType.CHERRY
};

/**
 * A container that displays a visual representation of a winning pattern
 */
export class CombinationIcon extends PIXI.Container {
    private config: CombinationIconConfig;
    private glyphContainers: PIXI.Graphics[] = [];
    private background: PIXI.Graphics;

    constructor(config: Partial<CombinationIconConfig> = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // Create background
        this.background = new PIXI.Graphics()
            .rect(0, 0, this.config.size, this.config.size)
            .fill({ color: 0xFFFFFF, alpha: 1 });
        this.addChild(this.background);
        this.setSize(this.config.size, this.config.size);
        // Initialize the pattern visualization
        this.initPattern();
    }

    /**
     * Initialize the pattern visualization based on the pattern type
     */
    private initPattern(): void {
        // Clear any existing glyph containers
        this.glyphContainers.forEach(container => {
            this.removeChild(container);
        });
        this.glyphContainers = [];

        // Get pattern matrix based on pattern type
        const patternMatrix = this.getPatternMatrix(this.config.pattern);
        
        // Calculate grid dimensions
        const rows = patternMatrix.length;
        const cols = patternMatrix[0].length;
        
        // Calculate cell size to fit within the container
        // For five in a row, allow width to be longer
        let cellWidth, cellHeight;
        
        if (this.config.pattern === WinCombinationType.FIVE_ACROSS) {
            // For five in a row, allow width to be longer
            cellWidth = this.config.size / cols;
            cellHeight = this.config.size / rows;
        } else {
            // Try to make it as square as possible
            const maxDimension = Math.max(rows, cols);
            cellWidth = this.config.size / maxDimension;
            cellHeight = this.config.size / maxDimension;
        }
        
        // Resize background to match actual pattern dimensions
        const actualWidth = cellWidth * cols;
        const actualHeight = cellHeight * rows;
        this.background.clear();
        this.background.rect(0, 0, actualWidth, actualHeight)
            .fill({ color: 0x333333, alpha: 0.2 });
        
        // Create glyph containers for each position in the pattern
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (patternMatrix[row][col] === 1) {
                    const glyphContainer = new PIXI.Graphics();
                    glyphContainer.rect(0, 0, this.config.glyphSize, this.config.glyphSize)
                        .fill({ color: 0xFFFF00, alpha: 1 });
                    // Position the glyph container
                    glyphContainer.position.set(
                        col * cellWidth + (cellWidth - this.config.glyphSize) / 2,
                        row * cellHeight + (cellHeight - this.config.glyphSize) / 2
                    );
                    
                    // Highlight the glyph to indicate it's part of the pattern
                    
                    this.addChild(glyphContainer);
                    this.glyphContainers.push(glyphContainer);
                }
            }
        }
    }

    /**
     * Get the pattern matrix based on the pattern type
     */
    private getPatternMatrix(patternType: WinCombinationType): number[][] {
        switch (patternType) {
            case WinCombinationType.THREE_ACROSS:
                return [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ];
            
            case WinCombinationType.FOUR_ACROSS:
                return [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                ];
            
            case WinCombinationType.FIVE_ACROSS:
                return [
                    [0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1],
                    [0, 0, 0, 0, 0],
                ];
            
            case WinCombinationType.THREE_DOWN:
                return [[0, 1, 0], [0, 1, 0], [0, 1, 0]];
            
            case WinCombinationType.THREE_DIAGONAL:
                // Forward diagonal
                return [
                    [1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1]
                ];
            
            case WinCombinationType.FIVE_MIRRORED_DIAGONAL:
                return [
                    [1, 0, 1],
                    [0, 1, 0],
                    [1, 0, 1]
                ];
            
            case WinCombinationType.NINE_SQUARE:
                return [
                    [1, 1, 1],
                    [1, 1, 1],
                    [1, 1, 1]
                ];
            
            case WinCombinationType.FIFTEEN_ALL_MATCH:
                return [
                    [1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1]
                ];
            
            default:
                // Default to three across
                return [[1, 1, 1]];
        }
    }

    /**
     * Set the pattern type to display
     */
    public setPattern(pattern: WinCombinationType): void {
        this.config.pattern = pattern;
        this.initPattern();
    }


    /**
     * Get the current pattern type
     */
    public getPattern(): WinCombinationType {
        return this.config.pattern;
    }
}
