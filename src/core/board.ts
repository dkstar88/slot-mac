import { createGlyphInstance, getRandomGlyph } from './glyphs';
import { GlyphInstance } from '../types/glyphs';
import { detectWins } from './winning-patterns';


function genBoard(rows: number, cols: number): GlyphInstance[][] {
    const board: GlyphInstance[][] = [];
    for (let row = 0; row < rows; row++) {
        const rowSymbols: GlyphInstance[] = [];
        for (let col = 0; col < cols; col++) {
            rowSymbols.push(createGlyphInstance(getRandomGlyph(), row, col));
        }
        board.push(rowSymbols);
    }    
    return board;
}

const MAX_RETRIES = 1000;

export function generateRandomBoard(
    rows: number = 3, 
    cols: number = 5, 
    minMultiplier: number = 0,
    minWinCount: number = 0    
): GlyphInstance[][]
{
    
    for (let i = 0; i < MAX_RETRIES; i++) {

        const board = genBoard(rows, cols);

        const wins = detectWins(board);
        const lowestMultiplier = wins.reduce((min, win) => Math.min(min, win.multiplier), Infinity);
    
        if (lowestMultiplier >= minMultiplier && wins.length >= minWinCount) {
            // Regenerate the board if the lowest multiplier is less than the minimum required
            return board;
        }
    }

    return genBoard(rows, cols);
    
}

export function getBoardColumn(board: GlyphInstance[][], col: number): GlyphInstance[] {
    return board.map(row => row[col]);
}
