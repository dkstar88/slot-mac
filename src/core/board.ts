import { createSymbolInstance, getRandomSymbol } from './symbols';
import { SymbolInstance } from '../types/symbols';
import { detectWins } from './winning-patterns';

export function generateRandomBoard(minMultiplier: number = 1): SymbolInstance[][]
{
    const board: SymbolInstance[][] = [];
    
    while (true) {
        for (let row = 0; row < 3; row++) {
            const rowSymbols: SymbolInstance[] = [];
            for (let col = 0; col < 5; col++) {
                rowSymbols.push(createSymbolInstance(getRandomSymbol(), row, col));
            }
            board.push(rowSymbols);
        }
        
        const wins = detectWins(board);
        const lowestMultiplier = wins.reduce((min, win) => Math.min(min, win.multiplier), Infinity);
    
        if (lowestMultiplier >= minMultiplier) {
            // Regenerate the board if the lowest multiplier is less than the minimum required
            break;
        }
    }

    return board;
}