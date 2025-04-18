import { SymbolInstance } from './symbols';

/**
 * Enum representing the different states of the game
 */
export enum GameStateType {
  IDLE = 'idle',
  SPINNING = 'spinning',
  EVALUATING = 'evaluating',
  CELEBRATING = 'celebrating'
}

/**
 * Interface representing the player's stats
 */
export interface PlayerStats {
  /** Current coin balance */
  coins: number;
  
  /** Total number of spins played */
  totalSpins: number;
  
  /** Total number of wins */
  totalWins: number;
  
  /** Largest win amount */
  largestWin: number;
}

/**
 * Interface representing a win in the game
 */
export interface Win {
  /** The symbols that are part of this win */
  symbols: SymbolInstance[];
  
  /** The type of winning combination */
  combinationType: string;
  
  /** The base payout value before multiplier */
  baseValue: number;
  
  /** The multiplier applied to this win */
  multiplier: number;
  
  /** The total payout value after multiplier */
  totalValue: number;
}

/**
 * Interface representing the current spin result
 */
export interface SpinResult {
  /** All symbols on the board after the spin */
  boardSymbols: SymbolInstance[][];
  
  /** All winning combinations from this spin */
  wins: Win[];
  
  /** Total payout from this spin */
  totalPayout: number;
  
  /** Whether this spin resulted in a jackpot */
  isJackpot: boolean;
}

/**
 * Interface representing the game's current state
 */
export interface IGameState {
  /** Current state of the game */
  currentState: GameStateType;
  
  /** Player's stats */
  playerStats: PlayerStats;
  
  /** Current multiplier value */
  currentMultiplier: number;
  
  /** Result of the current/last spin */
  currentSpinResult: SpinResult | null;
  
  /** Whether the player can spin (has enough coins, game not in spinning state) */
  canSpin: boolean;
  
  /** History of recent spins */
  recentSpins: SpinResult[];
}

/**
 * Interface for game state manager
 */
export interface IGameStateManager {
  /** Get the current game state */
  getState(): IGameState;
  
  /** Update the game state */
  setState(newState: Partial<IGameState>): void;
  
  /** Start a new spin */
  startSpin(): void;
  
  /** End the current spin and evaluate results */
  endSpin(result: SpinResult): void;
  
  /** Add coins to the player's balance */
  addCoins(amount: number): void;
  
  /** Deduct coins from the player's balance */
  deductCoins(amount: number): boolean;
  
  /** Update the multiplier */
  updateMultiplier(newMultiplier: number): void;
  
  /** Save the current game state */
  saveState(): void;
  
  /** Load a saved game state */
  loadState(): boolean;
  
  /** Reset the game state to default */
  resetState(): void;
}
