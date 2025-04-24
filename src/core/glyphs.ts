import { Glyph, GlyphInstance, GlyphType } from '../types/glyphs';

/**
 * Definitions for all glyphs in the game
 */
export const GLYPHS: Record<GlyphType, Glyph> = {
  [GlyphType.PINEAPPLE]: {
    type: GlyphType.PINEAPPLE,
    name: GlyphType.PINEAPPLE,
    emoji: '🍍',
    payoutValue: 21,
    rarityWeight: 1 // Rarest
  },
  [GlyphType.GRAPE]: {
    type: GlyphType.GRAPE,
    name: GlyphType.GRAPE,
    emoji: '🍇',
    payoutValue: 13,
    rarityWeight: 2
  },
  [GlyphType.STRAWBERRY]: {
    type: GlyphType.STRAWBERRY,
    emoji: '🍓',
    name: GlyphType.STRAWBERRY,
    payoutValue: 8,
    rarityWeight: 5
  },
  [GlyphType.WATERMELON]: {
    type: GlyphType.WATERMELON,
    emoji: '🍉',
    name: 'Watermelon',
    payoutValue: 5,
    rarityWeight: 7
  },
  [GlyphType.ORANGE]: {
    type: GlyphType.ORANGE,
    name: 'Orange',
    emoji: '🍊',
    payoutValue: 3,
    rarityWeight: 7
  },
  [GlyphType.LEMON]: {
    type: GlyphType.LEMON,
    name: 'Lemon',
    emoji: '🍋',
    payoutValue: 2,
    rarityWeight: 8
  },
  [GlyphType.CHERRY]: {
    type: GlyphType.CHERRY,
    name: 'Cherry',
    emoji: '🍒',
    payoutValue: 1,
    rarityWeight: 8 // Most common
  }
};

/**
 * Array of all glyphs
 */
export const GLYPHS_ARRAY = Object.values(GLYPHS);

/**
 * Get a random glyph based on rarity weights
 * @returns A randomly selected glyph
 */
export function getRandomGlyph(): Glyph {
  // Calculate total weight
  const totalWeight = GLYPHS_ARRAY.reduce((sum, glyph) => sum + glyph.rarityWeight, 0);
  
  // Generate a random number between 0 and totalWeight
  const randomValue = Math.random() * totalWeight;
  
  // Find the glyph that corresponds to the random value
  let weightSum = 0;
  for (const symbol of GLYPHS_ARRAY) {
    weightSum += symbol.rarityWeight;
    if (randomValue <= weightSum) {
      return symbol;
    }
  }
  
  // Fallback (should never happen)
  return GLYPHS_ARRAY[GLYPHS_ARRAY.length - 1];
}

/**
 * Generate a random board of glyphs
 * @param rows Number of rows
 * @param columns Number of columns
 * @returns 2D array of glyph instances
 */
export function generateRandomBoard(rows: number, columns: number): Glyph[][] {
  const board: Glyph[][] = [];
  
  for (let row = 0; row < rows; row++) {
    const rowSymbols: Glyph[] = [];
    for (let col = 0; col < columns; col++) {
      rowSymbols.push(getRandomGlyph());
    }
    board.push(rowSymbols);
  }
  
  return board;
}

/**
 * Create a glyph instance
 * @param glyph The glyph
 * @param row Row position
 * @param column Column position
 * @returns A new glyph instance
 */
export function createGlyphInstance(glyph: Glyph, row: number, column: number): GlyphInstance {
  return {
    glyph: glyph,
    row,
    column,
    isWinning: false,
    winningMultiplier: 1
  };
}

export function createGlyphInstanceFromType(glyph: GlyphType, row: number, column: number): GlyphInstance {
  return {
    glyph: GLYPHS[glyph],
    row,
    column,
    isWinning: false,
    winningMultiplier: 1
  };
}

export function printBoardToConsole(board: GlyphInstance[][]): void {
  board.forEach(row => {
    console.log(row.map(glyph => glyph.glyph.emoji).join(' | '));
  });
}
