/**
 * Enum representing the different glyph types in the game
 */
export enum GlyphType {
  PINEAPPLE = "pineapple",
  GRAPE = "grape",
  STRAWBERRY = "strawberry",
  WATERMELON = "watermelon",
  ORANGE = "orange",
  LEMON = "lemon",
  CHERRY = "cherry",
}

/**
 * Interface representing a glyph in the slot machine
 */
export interface Glyph {
  /** Unique identifier for the glyph */
  type: GlyphType;

  /** Display name of the glyph */
  name: string;
  emoji: string;

  /** Base payout value for this glyph */
  payoutValue: number;

  /** Weight determining how frequently this glyph appears (higher = more common) */
  rarityWeight: number;
}

/**
 * Interface representing a glyph instance on the game board
 */
export interface GlyphInstance {
  /** The glyph type */
  glyph: Glyph;

  /** Position on the board (column) */
  column: number;

  /** Position on the board (row) */
  row: number;

  /** Whether this glyph is part of a winning combination */
  isWinning: boolean;
  winningMultiplier: number;
}

/**
 * Interface representing a reel in the slot machine
 */
// export interface Reel {
//   /** The glyphs currently visible on this reel */
//   visibleSymbols: SymbolInstance[];

//   /** Whether the reel is currently spinning */
//   isSpinning: boolean;

//   /** The speed at which the reel is spinning */
//   spinSpeed: number;
// }
