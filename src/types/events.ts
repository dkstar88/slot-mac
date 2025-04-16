import { SpinResult } from './game-state';
import { SymbolInstance } from './symbols';
import { WinningPattern } from './winning-combinations';

/**
 * Enum representing the different types of game events
 */
export enum GameEventType {
  // Game state events
  GAME_INITIALIZED = 'game_initialized',
  GAME_STATE_CHANGED = 'game_state_changed',
  
  // Spin events
  SPIN_STARTED = 'spin_started',
  SPIN_ENDED = 'spin_ended',
  REEL_STOPPED = 'reel_stopped',
  ALL_REELS_STOPPED = 'all_reels_stopped',
  
  // Win events
  WIN_DETECTED = 'win_detected',
  WINS_EVALUATED = 'wins_evaluated',
  PAYOUT_CALCULATED = 'payout_calculated',
  
  // Player events
  COINS_ADDED = 'coins_added',
  COINS_DEDUCTED = 'coins_deducted',
  MULTIPLIER_CHANGED = 'multiplier_changed',
  
  // UI events
  SPIN_BUTTON_CLICKED = 'spin_button_clicked',
  CELEBRATION_STARTED = 'celebration_started',
  CELEBRATION_ENDED = 'celebration_ended'
}

/**
 * Base interface for all game events
 */
export interface GameEvent {
  /** Type of the event */
  type: GameEventType;
  
  /** Timestamp when the event was created */
  timestamp: number;
}

/**
 * Interface for spin started event
 */
export interface SpinStartedEvent extends GameEvent {
  type: GameEventType.SPIN_STARTED;
  
  /** Current coin balance before spin */
  currentCoins: number;
  
  /** Cost of the spin */
  spinCost: number;
}

/**
 * Interface for reel stopped event
 */
export interface ReelStoppedEvent extends GameEvent {
  type: GameEventType.REEL_STOPPED;
  
  /** Index of the reel that stopped */
  reelIndex: number;
  
  /** Symbols on the stopped reel */
  symbols: SymbolInstance[];
}

/**
 * Interface for all reels stopped event
 */
export interface AllReelsStoppedEvent extends GameEvent {
  type: GameEventType.ALL_REELS_STOPPED;
  
  /** All symbols on the board */
  boardSymbols: SymbolInstance[][];
}

/**
 * Interface for win detected event
 */
export interface WinDetectedEvent extends GameEvent {
  type: GameEventType.WIN_DETECTED;
  
  /** The winning pattern */
  pattern: WinningPattern;
  
  /** The symbols that form the winning combination */
  symbols: SymbolInstance[];
}

/**
 * Interface for wins evaluated event
 */
export interface WinsEvaluatedEvent extends GameEvent {
  type: GameEventType.WINS_EVALUATED;
  
  /** All winning combinations */
  wins: {
    pattern: WinningPattern;
    symbols: SymbolInstance[];
  }[];
  
  /** Whether this spin resulted in a jackpot */
  isJackpot: boolean;
}

/**
 * Interface for payout calculated event
 */
export interface PayoutCalculatedEvent extends GameEvent {
  type: GameEventType.PAYOUT_CALCULATED;
  
  /** Total payout amount */
  amount: number;
  
  /** Current multiplier applied */
  multiplier: number;
  
  /** New multiplier after this win (if changed) */
  newMultiplier: number | null;
}

/**
 * Interface for spin ended event
 */
export interface SpinEndedEvent extends GameEvent {
  type: GameEventType.SPIN_ENDED;
  
  /** Result of the spin */
  result: SpinResult;
}

/**
 * Interface for the event system
 */
export interface EventSystem {
  /**
   * Subscribe to an event
   * @param eventType Type of event to subscribe to
   * @param callback Function to call when the event occurs
   * @returns Unsubscribe function
   */
  subscribe<T extends GameEvent>(
    eventType: GameEventType,
    callback: (event: T) => void
  ): () => void;
  
  /**
   * Publish an event
   * @param event The event to publish
   */
  publish<T extends GameEvent>(event: T): void;
  
  /**
   * Unsubscribe all listeners for a specific event type
   * @param eventType Type of event to unsubscribe from
   */
  unsubscribeAll(eventType: GameEventType): void;
}
