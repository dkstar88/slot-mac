import { SymbolInstance } from '../types/symbols';
import { WinCombinationType, WinningPattern } from '../types/winning-combinations';

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
function* checkSymbolsMatch(board: SymbolInstance[][], patternMatrix: number[][]): IterableIterator<SymbolInstance[]>
{

  // Convert board to 2d matrix of symbols
  const board2d = board.map(row => row.map(symbol => symbol));

  // Slice board2d to all possible that can match the patternMatrix
  for (let i = 0; i < board2d.length - patternMatrix.length + 1; i++) {
    for (let j = 0; j < board2d[0].length - patternMatrix[0].length + 1; j++) {
      const slicedBoard = board2d.slice(i, i + patternMatrix.length).map(row => row.slice(j, j + patternMatrix[0].length));
      const firstSymbol = board[patternMatrix[0][0]][patternMatrix[0][1]].symbol;
      const matchingSymbols: SymbolInstance[] = [];
      var isMatch = true;
      for (const [row, col] of patternMatrix) {
        const pattern = patternMatrix[row][col];
        const symbol = slicedBoard[row][col];
        if (pattern === 0) continue; // Skip empty positions
        if (symbol.symbol !== firstSymbol) {
          isMatch = false;
          break;
        }
        matchingSymbols.push(symbol);
      }
      if (isMatch) {
        yield matchingSymbols;
      }
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
 * Detect all winning combinations on the board
 * @param board The current state of the game board
 * @returns Array of winning combinations
 */
export function detectWinningCombinations(board: SymbolInstance[][]) {
  const winningCombinations: { pattern: WinningPattern; symbols: SymbolInstance[] }[] = [];
  
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

/**
 * Calculate the total payout for all winning combinations
 * @param winningCombinations Array of winning combinations
 * @param currentMultiplier The current game multiplier
 * @returns Total payout value
 */
export function calculatePayout(
  winningCombinations: { pattern: WinningPattern; symbols: SymbolInstance[] }[],
  currentMultiplier: number
): number {
  let totalPayout = 0;
  
  for (const { pattern, symbols } of winningCombinations) {
    // Get the symbol value (all symbols in a combination are the same)
    const symbolValue = symbols[0].symbol.payoutValue;
    
    // Calculate the payout for this combination
    const combinationPayout = symbolValue * pattern.multiplier * currentMultiplier;
    
    totalPayout += combinationPayout;
  }
  
  return totalPayout;
}

/**
 * Determine if the winning combinations should increase the multiplier
 * @param winningCombinations Array of winning combinations
 * @returns New multiplier value or null if no change
 */
export function determineMultiplierIncrease(
  winningCombinations: { pattern: WinningPattern; symbols: SymbolInstance[] }[]
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
