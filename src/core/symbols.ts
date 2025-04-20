import { Symbol, SymbolInstance, SymbolType } from '../types/symbols';

/**
 * Definitions for all symbols in the game
 */
export const SYMBOLS: Record<SymbolType, Symbol> = {
  [SymbolType.PINEAPPLE]: {
    type: SymbolType.PINEAPPLE,
    name: SymbolType.PINEAPPLE,
    emoji: '🍍',
    payoutValue: 21,
    rarityWeight: 1 // Rarest
  },
  [SymbolType.GRAPE]: {
    type: SymbolType.GRAPE,
    name: SymbolType.GRAPE,
    emoji: '🍇',
    payoutValue: 13,
    rarityWeight: 2
  },
  [SymbolType.STRAWBERRY]: {
    type: SymbolType.STRAWBERRY,
    emoji: '🍓',
    name: SymbolType.STRAWBERRY,
    payoutValue: 8,
    rarityWeight: 3
  },
  [SymbolType.WATERMELON]: {
    type: SymbolType.WATERMELON,
    emoji: '🍉',
    name: 'Watermelon',
    payoutValue: 5,
    rarityWeight: 5
  },
  [SymbolType.ORANGE]: {
    type: SymbolType.ORANGE,
    name: 'Orange',
    emoji: '🍊',
    payoutValue: 3,
    rarityWeight: 8
  },
  [SymbolType.LEMON]: {
    type: SymbolType.LEMON,
    name: 'Lemon',
    emoji: '🍋',
    payoutValue: 2,
    rarityWeight: 13
  },
  [SymbolType.CHERRY]: {
    type: SymbolType.CHERRY,
    name: 'Cherry',
    emoji: '🍒',
    payoutValue: 1,
    rarityWeight: 21 // Most common
  }
};

/**
 * Array of all symbols
 */
export const SYMBOLS_ARRAY = Object.values(SYMBOLS);

/**
 * Get a random symbol based on rarity weights
 * @returns A randomly selected symbol
 */
export function getRandomSymbol(): Symbol {
  // Calculate total weight
  const totalWeight = SYMBOLS_ARRAY.reduce((sum, symbol) => sum + symbol.rarityWeight, 0);
  
  // Generate a random number between 0 and totalWeight
  const randomValue = Math.random() * totalWeight;
  
  // Find the symbol that corresponds to the random value
  let weightSum = 0;
  for (const symbol of SYMBOLS_ARRAY) {
    weightSum += symbol.rarityWeight;
    if (randomValue <= weightSum) {
      return symbol;
    }
  }
  
  // Fallback (should never happen)
  return SYMBOLS_ARRAY[SYMBOLS_ARRAY.length - 1];
}

/**
 * Generate a random board of symbols
 * @param rows Number of rows
 * @param columns Number of columns
 * @returns 2D array of symbol instances
 */
export function generateRandomBoard(rows: number, columns: number): Symbol[][] {
  const board: Symbol[][] = [];
  
  for (let row = 0; row < rows; row++) {
    const rowSymbols: Symbol[] = [];
    for (let col = 0; col < columns; col++) {
      rowSymbols.push(getRandomSymbol());
    }
    board.push(rowSymbols);
  }
  
  return board;
}

/**
 * Create a symbol instance
 * @param symbol The symbol
 * @param row Row position
 * @param column Column position
 * @returns A new symbol instance
 */
export function createSymbolInstance(symbol: Symbol, row: number, column: number) {
  return {
    symbol,
    row,
    column,
    isWinning: false,
    winningMultiplier: 1
  };
}

export function createSymbolInstanceFromType(symbol: SymbolType, row: number, column: number) {
  return {
    symbol: SYMBOLS[symbol],
    row,
    column,
    isWinning: false,
    winningMultiplier: 1
  };
}

export function printBoardToConsole(board: SymbolInstance[][]): void {
  board.forEach(row => {
    console.log(row.map(symbol => symbol.symbol.emoji).join(' | '));
  });
}