import { GlyphInstance, GlyphType } from '../types/glyphs';
import { WinCombinationType, WinningPattern } from '../types/winning-combinations';
import { Win } from '../types/game-state';
/**
 * Check if all symbols in the given positions match
 * @param board The game board
 * @param positions Array of [row, column] positions to check
 * @returns Array of matching symbols or null if no match
 * 
 * 3 Across [[1, 1, 1]]
 * 3 Down [[1], [1], [1]]
 * 4 Across [[1, 1, 1, 1]]
 * 5 Across [[1, 1, 1, 1, 1]]
 * 3 Forward Diagonal [[1, 0, 0],
 *                     [0, 1, 0],
 *                     [0, 0, 1]]
 * 3 Backward Diagonal [[0, 0, 1],
 *                      [0, 1, 0],
 *                      [1, 0, 0]]
 * 
 */

export function* sliceArray<T>(array: T[][], x: number, y: number): IterableIterator<T[][]> {
  for (let i = 0; i < array.length - x + 1; i++) {
    for (let j = 0; j < array[i].length - y + 1; j++) {
      yield array.slice(i, i + x).map(row => row.slice(j, j + y));
    }
  }
}

export function* checkSymbolsMatch(board: GlyphInstance[][], patternMatrix: number[][]): IterableIterator<GlyphInstance[]>
{

  // // Convert board to 2d matrix of symbols
  // const board2d = board.map(row => row.map(symbol => symbol));

  // Slice board2d to all possible that can match the patternMatrix
  for (const sliced of sliceArray(board, patternMatrix.length, patternMatrix[0].length)) {
    let firstSymbol: GlyphType | null = null;
    const matchingSymbols: GlyphInstance[] = [];
    var isMatch = true;
    sliced.forEach((row, rowIndex) => {
      row.forEach((symbol, colIndex) => {
        if (patternMatrix[rowIndex][colIndex] === 1) {
          if (firstSymbol === null) {
            firstSymbol = symbol.glyph.type;
          } else if (symbol.glyph.type !== firstSymbol) {
            isMatch = false;
          }
          matchingSymbols.push(symbol);
        }
      });
    });
    if (isMatch) {
      yield matchingSymbols;
    }
  }

}

/**
 * Definition of all winning patterns in the game
 */
export const WINNING_PATTERNS: WinningPattern[] = [
  // 3 Across (for each row)
  {
    type: WinCombinationType.THREE_ACROSS,
    group: 'across',
    name: '3 Across',
    description: 'Three Across in rows',
    multiplier: 1,
    checkMatch: (board) => checkSymbolsMatch(board, [[1, 1, 1]])
  }, 
  // 4 Across (for each row)
  {
    type: WinCombinationType.FOUR_ACROSS,
    group: 'across',
    name: '4 Across (Top)',
    description: 'Four matching symbols in the top row',
    multiplier: 1.5,
    checkMatch: (board) => checkSymbolsMatch(board, [[1, 1, 1, 1]])
  },
  // 5 Across (for each row)
  {
    type: WinCombinationType.FIVE_ACROSS,
    group: 'across',
    name: '5 Across (Top)',
    description: 'Five matching symbols in the top row',
    multiplier: 2,    
    checkMatch: (board) => checkSymbolsMatch(board, [[1, 1, 1, 1, 1]])
  },
  // 3 Down (for each column)
  {
    type: WinCombinationType.THREE_DOWN,
    group: 'down',
    name: '3 Down',
    description: 'Three matching symbols in columns',
    multiplier: 1,
    checkMatch: (board) => checkSymbolsMatch(board, [[1], [1], [1]])
  }, 
  // 3 Diagonal
  {
    type: WinCombinationType.THREE_DIAGONAL,
    group: 'diagonal',
    name: '3 Forward Diagonal',
    description: 'Three matching symbols in a forward diagonal',
    multiplier: 1.5,
    checkMatch: (board) => checkSymbolsMatch(board, [[1, 0, 0], [0, 1, 0], [0, 0, 1]])
  },
  {
    type: WinCombinationType.THREE_DIAGONAL,
    group: 'diagonal',
    name: '3 Backward Diagonal',
    description: 'Three matching symbols in a backward diagonal',
    multiplier: 1.5,
    checkMatch: (board) => checkSymbolsMatch(board, [[0, 0, 1], [0, 1, 0], [1, 0, 0]])
  },  

  {
    type: WinCombinationType.FIVE_MIRRORED_DIAGONAL,
    group: 'diagonal',
    name: '5 Star Diagonal',
    description: 'Star Diagonal',
    multiplier: 1.5,
    checkMatch: (board) => checkSymbolsMatch(board, [[1, 0, 1], [0, 1, 0], [1, 0, 1]])
  },  
  // 9 Square (3x3 square)
  {
    type: WinCombinationType.NINE_SQUARE,
    group: 'square',
    name: '9 Square',
    description: 'Nine matching symbols forming a 3x3 square',
    multiplier: 4,
    checkMatch: (board) => checkSymbolsMatch(board, [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ])
  },
  
  // 15 All Match Jackpot (entire 3x5 board)
  {
    type: WinCombinationType.FIFTEEN_ALL_MATCH,
    group: 'jackpot',
    name: '15 All Match Jackpot',
    description: 'All 15 symbols on the board match',
    multiplier: 5,
    checkMatch: (board) => checkSymbolsMatch(board, [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ])
  }
];

/** 
 * Transform board symbols to proper 2d matrix based on row, column of symbol
 *
 */
export function transformBoardSymbolsToMatrix(board: GlyphInstance[][]): GlyphInstance[][] {
  const matrix: GlyphInstance[][] = [];
  
  for (let i = 0; i < board[0].length; i++) {
    const row: GlyphInstance[] = new Array<GlyphInstance>(board.length);
    for (let j = 0; j < board.length; j++) {
      const symbol = board[j][i];
      row[j] = symbol;
    }
    matrix.push(row);
  }

  return matrix;
}

/**
 * Detect all winning combinations on the board
 * @param board The current state of the game board
 * @returns Array of winning combinations
 */
export function detectWinningCombinations(board: GlyphInstance[][]) {
  const winningCombinations: { pattern: WinningPattern; symbols: GlyphInstance[] }[] = [];
  
  for (const pattern of WINNING_PATTERNS) {
    for (const matchingSymbols of pattern.checkMatch(board)) {
      matchingSymbols.forEach(symbol => {      
        symbol.isWinning = true;
        if (pattern.multiplier > symbol.winningMultiplier) {
          symbol.winningMultiplier = pattern.multiplier;
        }                  
      });
      winningCombinations.push({
        pattern,
        symbols: matchingSymbols
      });      
    }
  }
  
  return winningCombinations;
}

export function detectWins(board: GlyphInstance[][]): Win[] {
  const winningCombinations = detectWinningCombinations(board);
  const wins: Win[] = winningCombinations.map(({ pattern, symbols }) => {

    const symbolValue = Math.floor(symbols.reduce((acc, symbol) => acc + symbol.glyph.payoutValue, 0) / symbols.length);
    const baseValue = symbolValue;
    const totalValue = Math.floor(symbols.reduce((acc, symbol) => acc + (symbol.glyph.payoutValue * pattern.multiplier), 0));
    return {
      symbols,
      combinationType: pattern.type,
      baseValue,
      multiplier: pattern.multiplier,
      totalValue
    };
  });
  
  return wins;
}


/**
 * Calculate the total payout for all winning combinations
 * @param winningCombinations Array of winning combinations
 * @param currentMultiplier The current game multiplier
 * @returns Total payout value
 */
export function calculatePayout(
  wins: Win[],
  currentMultiplier: number
): number {
  const totalPayout = wins.reduce((acc, win) => acc + win.totalValue, 0) * currentMultiplier;
 
  return totalPayout;
}

/**
 * Determine if the winning combinations should increase the multiplier
 * @param winningCombinations Array of winning combinations
 * @returns New multiplier value or null if no change
 */
export function determineMultiplierIncrease(
  winningCombinations: { pattern: WinningPattern; symbols: GlyphInstance[] }[]
): number | null {
  // Check for jackpot (highest priority)
  const jackpot = winningCombinations.find(
    ({ pattern }) => pattern.type === WinCombinationType.FIFTEEN_ALL_MATCH
  );
  if (jackpot) return 5;
  
  // Check for 9 square
  const nineSquare = winningCombinations.find(
    ({ pattern }) => pattern.type === WinCombinationType.NINE_SQUARE
  );
  if (nineSquare) return 4;
  
  // Check for 5 mirrored diagonal
  const mirroredDiagonal = winningCombinations.find(
    ({ pattern }) => pattern.type === WinCombinationType.FIVE_MIRRORED_DIAGONAL
  );
  if (mirroredDiagonal) return 3;
  
  // Check for 5 across
  const fiveAcross = winningCombinations.find(
    ({ pattern }) => pattern.type === WinCombinationType.FIVE_ACROSS
  );
  if (fiveAcross) return 2;
  
  // No multiplier increase
  return null;
}
