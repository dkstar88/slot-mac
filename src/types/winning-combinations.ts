import { SymbolInstance } from './symbols';

/**
 * Enum representing the different types of winning combinations
 */
export enum WinCombinationType {
  THREE_ACROSS = 'three_across',
  THREE_DOWN = 'three_down',
  THREE_DIAGONAL = 'three_diagonal',
  FOUR_ACROSS = 'four_across',
  FIVE_ACROSS = 'five_across',
  FIVE_MIRRORED_DIAGONAL = 'five_mirrored_diagonal',
  NINE_SQUARE = 'nine_square',
  FIFTEEN_ALL_MATCH = 'fifteen_all_match'
}

/**
 * Interface representing a winning pattern definition
 */
export interface WinningPattern {
  /** Unique identifier for the pattern */
  type: WinCombinationType;
  group: string;
  /** Display name of the pattern */
  name: string;
  
  /** Description of the pattern */
  description: string;
  
  /** Base multiplier for this pattern */
  multiplier: number;
  
  /** Matrix defining the pattern shape (1 = include position) */
  // coordinates: number[][];
  
  /** Function to check if the pattern is matched on the board */
  checkMatch(board: SymbolInstance[][]): IterableIterator<SymbolInstance[]>;
}

/**
 * Interface for the winning combinations detector
 */
export interface WinningCombinationsDetector {
  /** All available winning patterns */
  patterns: WinningPattern[];
  
  /** 
   * Detect all winning combinations on the board
   * @param board The current state of the game board
   * @returns Array of winning combinations
   */
  detectWinningCombinations(board: SymbolInstance[][]): {
    pattern: WinningPattern;
    symbols: SymbolInstance[];
  }[];
  
  /**
   * Calculate the total payout for all winning combinations
   * @param winningCombinations Array of winning combinations
   * @param currentMultiplier The current game multiplier
   * @returns Total payout value
   */
  calculatePayout(
    winningCombinations: {
      pattern: WinningPattern;
      symbols: SymbolInstance[];
    }[],
    currentMultiplier: number
  ): number;
  
  /**
   * Determine if the winning combinations should increase the multiplier
   * @param winningCombinations Array of winning combinations
   * @returns New multiplier value or null if no change
   */
  determineMultiplierIncrease(
    winningCombinations: {
      pattern: WinningPattern;
      symbols: SymbolInstance[];
    }[]
  ): number | null;
}
