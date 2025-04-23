import { createSymbolInstance, getRandomSymbol } from './symbols';
import { SymbolInstance } from '../types/symbols';
import { detectWins } from './winning-patterns';


function genBoard(rows: number, cols: number): SymbolInstance[][] {
    const board: SymbolInstance[][] = [];
    for (let row = 0; row < rows; row++) {
        const rowSymbols: SymbolInstance[] = [];
        for (let col = 0; col < cols; col++) {
            rowSymbols.push(createSymbolInstance(getRandomSymbol(), row, col));
        }
        board.push(rowSymbols);
    }    
    return board;
}

const MAX_RETRIES = 1000;

export function generateRandomBoard(
    rows: number = 3, 
    cols: number = 5, 
    minMultiplier: number = 1,
    minWinCount: number = 1    
): SymbolInstance[][]
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

export function getBoardColumn(board: SymbolInstance[][], col: number): SymbolInstance[] {
    return board.map(row => row[col]);
}