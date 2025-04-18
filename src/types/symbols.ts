/**
 * Enum representing the different symbol types in the game
 */
export enum SymbolType {
  PINEAPPLE = 'pineapple',
  GRAPE = 'grape',
  STRAWBERRY = 'strawberry',
  WATERMELON = 'watermelon',
  ORANGE = 'orange',
  LEMON = 'lemon',
  CHERRY = 'cherry'
}



/**
 * Interface representing a symbol in the slot machine
 */
export interface Symbol {
  /** Unique identifier for the symbol */
  type: SymbolType;
  
  /** Display name of the symbol */
  name: string;
  emoji: string;
  
 
  /** Base payout value for this symbol */
  payoutValue: number;
  
  /** Weight determining how frequently this symbol appears (higher = more common) */
  rarityWeight: number;
}

/**
 * Interface representing a symbol instance on the game board
 */
export interface SymbolInstance {
  /** The symbol type */
  symbol: Symbol;
  
  /** Position on the board (column) */
  column: number;
  
  /** Position on the board (row) */
  row: number;
  
  /** Whether this symbol is part of a winning combination */
  isWinning: boolean;
  winningMultiplier: number;
}

/**
 * Interface representing a reel in the slot machine
 */
export interface Reel {
  /** The symbols currently visible on this reel */
  visibleSymbols: SymbolInstance[];
  
  /** Whether the reel is currently spinning */
  isSpinning: boolean;
  
  /** The speed at which the reel is spinning */
  spinSpeed: number;
}
