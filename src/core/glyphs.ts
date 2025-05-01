import { Glyph, GlyphInstance, GlyphType } from "../types/glyphs";
import logger from "../utils/logger";

const BASE_GLYPHS: Record<GlyphType, Glyph> = {
  [GlyphType.PINEAPPLE]: {
    type: GlyphType.PINEAPPLE,
    name: GlyphType.PINEAPPLE,
    emoji: "🍍",
    payoutValue: 15,
    rarityWeight: 13, // Rarest
  },
  [GlyphType.GRAPE]: {
    type: GlyphType.GRAPE,
    name: GlyphType.GRAPE,
    emoji: "🍇",
    payoutValue: 10,
    rarityWeight: 14,
  },
  [GlyphType.STRAWBERRY]: {
    type: GlyphType.STRAWBERRY,
    emoji: "🍓",
    name: GlyphType.STRAWBERRY,
    payoutValue: 8,
    rarityWeight: 15,
  },
  [GlyphType.WATERMELON]: {
    type: GlyphType.WATERMELON,
    emoji: "🍉",
    name: "Watermelon",
    payoutValue: 5,
    rarityWeight: 16,
  },
  [GlyphType.ORANGE]: {
    type: GlyphType.ORANGE,
    name: "Orange",
    emoji: "🍊",
    payoutValue: 3,
    rarityWeight: 17,
  },
  [GlyphType.LEMON]: {
    type: GlyphType.LEMON,
    name: "Lemon",
    emoji: "🍋",
    payoutValue: 2,
    rarityWeight: 18,
  },
  [GlyphType.CHERRY]: {
    type: GlyphType.CHERRY,
    name: "Cherry",
    emoji: "🍒",
    payoutValue: 1,
    rarityWeight: 19, // Most common
  },
};

/**
 * Definitions for all glyphs in the game
 */
export var GLYPHS = structuredClone(BASE_GLYPHS);

/**
 * Array of all glyphs
 */
export const GLYPHS_ARRAY = Object.values(GLYPHS);

class _GlyphManager {
  private glyphs: Record<GlyphType, Glyph>;

  constructor() {
    this.glyphs = structuredClone(BASE_GLYPHS);
  }

  getGlyph(type: GlyphType): Glyph {
    return this.glyphs[type];
  }

  addGlyph(glyph: Glyph): void {
    this.glyphs[glyph.type] = glyph;
  }

  removeGlyph(type: GlyphType): void {
    delete this.glyphs[type];
  }

  getTotalWeight(): number {
    return Object.values(this.glyphs).reduce(
      (sum, glyph) => sum + glyph.rarityWeight,
      0,
    );
  }

  getGlyphWeightPercentage(type: GlyphType): number {
    const glyph = this.glyphs[type];
    return (glyph.rarityWeight / this.getTotalWeight()) * 100;
  }

  setGlyphWeight(type: GlyphType, weight: number): void {
    const glyph = this.glyphs[type];
    if (glyph) {
      glyph.rarityWeight = weight;
    } else {
      throw new Error(`Glyph of type ${type} does not exist.`);
    }
  }

  incGlyphWeight(type: GlyphType, weight: number): void {
    const glyph = this.glyphs[type];
    if (glyph) {
      glyph.rarityWeight += weight;
    } else {
      throw new Error(`Glyph of type ${type} does not exist.`);
    }
  }

  getGlyphPayoutValue(type: GlyphType): number {
    const glyph = this.glyphs[type];
    if (glyph) {
      return glyph.payoutValue;
    } else {
      throw new Error(`Glyph of type ${type} does not exist.`);
    }
  }

  setGlyphPayoutValue(type: GlyphType, value: number): void {
    const glyph = this.glyphs[type];
    if (glyph) {
      glyph.payoutValue = value;
    } else {
      throw new Error(`Glyph of type ${type} does not exist.`);
    }
  }

  incGlyphPayoutValue(type: GlyphType, value: number): void {
    const glyph = this.glyphs[type];
    if (glyph) {
      glyph.payoutValue += value;
    } else {
      throw new Error(`Glyph of type ${type} does not exist.`);
    }
  }

  getRandomGlyph(): Glyph {
    // Calculate total weight
    const totalWeight = this.getTotalWeight();

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
}

export const GlyphManager = new _GlyphManager();

/**
 * Get a random glyph based on rarity weights
 * @returns A randomly selected glyph
 */
export function getRandomGlyph(): Glyph {
  return GlyphManager.getRandomGlyph();
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
export function createGlyphInstance(
  glyph: Glyph,
  row: number,
  column: number,
): GlyphInstance {
  return {
    glyph: glyph,
    row,
    column,
    isWinning: false,
    winningMultiplier: 1,
  };
}

export function createGlyphInstanceFromType(
  glyph: GlyphType,
  row: number,
  column: number,
): GlyphInstance {
  return {
    glyph: GLYPHS[glyph],
    row,
    column,
    isWinning: false,
    winningMultiplier: 1,
  };
}

export function printBoardToConsole(board: GlyphInstance[][]): void {
  board.forEach((row) => {
    logger.info(row.map((glyph) => glyph.glyph.emoji).join(" | "));
  });
}
