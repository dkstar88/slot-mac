import { 
  GameState, 
  GameStateManager, 
  GameStateType, 
  PlayerStats, 
  SpinResult 
} from '../types/game-state';
import { eventManager, publishEvent } from '../utils/event-system';
import { GameEventType } from '../types/events';

/**
 * Default game state
 */
const DEFAULT_GAME_STATE: GameState = {
  currentState: GameStateType.IDLE,
  playerStats: {
    coins: 100,
    totalSpins: 0,
    totalWins: 0,
    largestWin: 0
  },
  currentMultiplier: 1,
  currentSpinResult: null,
  canSpin: true,
  recentSpins: []
};

/**
 * Maximum number of recent spins to keep in history
 */
const MAX_RECENT_SPINS = 10;

/**
 * Implementation of the game state manager
 */
export class GameStateManagerImpl implements GameStateManager {
  // Current game state
  private state: GameState;
  
  /**
   * Constructor
   */
  constructor() {
    // Initialize with default state or load from storage
    this.state = this.loadStateFromStorage() || { ...DEFAULT_GAME_STATE };
    
    // Always reset to IDLE state on startup
    this.resetToIdle();
  }
  
  /**
   * Get the current game state
   * @returns Current game state
   */
  getState(): GameState {
    return { ...this.state };
  }
  
  /**
   * Update the game state
   * @param newState Partial state to update
   */
  setState(newState: Partial<GameState>): void {
    // Update the state
    this.state = {
      ...this.state,
      ...newState
    };
    
    // Publish state changed event
    publishEvent(GameEventType.GAME_STATE_CHANGED, {
      state: this.getState()
    });
    
    // Save state to storage
    this.saveStateToStorage();
  }
  
  /**
   * Start a new spin
   */
  startSpin(): void {
    // Check if can spin
    if (!this.state.canSpin || this.state.currentState !== GameStateType.IDLE) {
      return;
    }
    
    // Check if has enough coins
    if (this.state.playerStats.coins < 1) {
      return;
    }
    
    // Deduct coin
    this.deductCoins(1);
    
    // Update player stats
    const updatedStats: PlayerStats = {
      ...this.state.playerStats,
      totalSpins: this.state.playerStats.totalSpins + 1
    };
    
    // Update state
    this.setState({
      currentState: GameStateType.SPINNING,
      playerStats: updatedStats,
      canSpin: false,
      currentSpinResult: null
    });
    
    // Publish spin started event
    publishEvent(GameEventType.SPIN_STARTED, {
      currentCoins: this.state.playerStats.coins,
      spinCost: 1
    });
  }
  
  /**
   * End the current spin and evaluate results
   * @param result Spin result
   */
  endSpin(result: SpinResult): void {
    // Check if in spinning state
    if (this.state.currentState !== GameStateType.SPINNING) {
      return;
    }
    
    // Update state to evaluating
    this.setState({
      currentState: GameStateType.EVALUATING,
      currentSpinResult: result
    });
    
    // Process wins
    if (result.wins.length > 0) {
      // Add coins
      this.addCoins(result.totalPayout);
      
      // Update player stats
      const updatedStats: PlayerStats = {
        ...this.state.playerStats,
        totalWins: this.state.playerStats.totalWins + 1,
        largestWin: Math.max(this.state.playerStats.largestWin, result.totalPayout)
      };
      
      // Update state
      this.setState({
        playerStats: updatedStats,
        currentState: GameStateType.CELEBRATING
      });
      
      // Publish wins evaluated event
      publishEvent(GameEventType.WINS_EVALUATED, {
        wins: result.wins.map(win => ({
          pattern: { type: win.combinationType } as any,
          symbols: win.symbols
        })),
        isJackpot: result.isJackpot
      });
      
      // Publish payout calculated event
      publishEvent(GameEventType.PAYOUT_CALCULATED, {
        amount: result.totalPayout,
        multiplier: this.state.currentMultiplier,
        newMultiplier: null // This would be calculated based on win type
      });
      
      // Add to recent spins
      const recentSpins = [result, ...this.state.recentSpins].slice(0, MAX_RECENT_SPINS);
      this.setState({ recentSpins });
      
      // After a delay, return to idle state
      setTimeout(() => {
        this.setState({
          currentState: GameStateType.IDLE,
          canSpin: true
        });
        
        // Publish celebration ended event
        publishEvent(GameEventType.CELEBRATION_ENDED, {});
      }, 3000); // 3 second celebration
    } else {
      // No wins, return to idle state
      this.setState({
        currentState: GameStateType.IDLE,
        canSpin: true
      });
      
      // Add to recent spins
      const recentSpins = [result, ...this.state.recentSpins].slice(0, MAX_RECENT_SPINS);
      this.setState({ recentSpins });
    }
    
    // Publish spin ended event
    publishEvent(GameEventType.SPIN_ENDED, {
      result
    });
  }
  
  /**
   * Add coins to the player's balance
   * @param amount Amount of coins to add
   */
  addCoins(amount: number): void {
    if (amount <= 0) return;
    
    const updatedStats: PlayerStats = {
      ...this.state.playerStats,
      coins: this.state.playerStats.coins + amount
    };
    
    this.setState({
      playerStats: updatedStats
    });
    
    // Publish coins added event
    publishEvent(GameEventType.COINS_ADDED, {
      amount,
      newBalance: updatedStats.coins
    });
  }
  
  /**
   * Deduct coins from the player's balance
   * @param amount Amount of coins to deduct
   * @returns Whether the deduction was successful
   */
  deductCoins(amount: number): boolean {
    if (amount <= 0) return true;
    
    // Check if player has enough coins
    if (this.state.playerStats.coins < amount) {
      return false;
    }
    
    const updatedStats: PlayerStats = {
      ...this.state.playerStats,
      coins: this.state.playerStats.coins - amount
    };
    
    this.setState({
      playerStats: updatedStats
    });
    
    // Publish coins deducted event
    publishEvent(GameEventType.COINS_DEDUCTED, {
      amount,
      newBalance: updatedStats.coins
    });
    
    return true;
  }
  
  /**
   * Update the multiplier
   * @param newMultiplier New multiplier value
   */
  updateMultiplier(newMultiplier: number): void {
    if (newMultiplier <= 0) return;
    
    this.setState({
      currentMultiplier: newMultiplier
    });
    
    // Publish multiplier changed event
    publishEvent(GameEventType.MULTIPLIER_CHANGED, {
      oldMultiplier: this.state.currentMultiplier,
      newMultiplier
    });
  }
  
  /**
   * Save the current game state to localStorage
   */
  saveState(): void {
    this.saveStateToStorage();
  }
  
  /**
   * Load a saved game state from localStorage
   * @returns Whether the load was successful
   */
  loadState(): boolean {
    const savedState = this.loadStateFromStorage();
    
    if (savedState) {
      this.state = savedState;
      return true;
    }
    
    return false;
  }
  
  /**
   * Reset the game state to default
   */
  resetState(): void {
    this.state = { ...DEFAULT_GAME_STATE };
    localStorage.removeItem('fruitfulFortune_gameState');
    
    // Publish game state changed event
    publishEvent(GameEventType.GAME_STATE_CHANGED, {
      state: this.getState()
    });
  }
  
  /**
   * Reset the game state to IDLE
   */
  resetToIdle(): void {
    console.log("Resetting game state to IDLE");
    this.setState({
      currentState: GameStateType.IDLE,
      canSpin: true,
      currentSpinResult: null
    });
  }
  
  /**
   * Save the current game state to localStorage
   * @private
   */
  private saveStateToStorage(): void {
    try {
      localStorage.setItem('fruitfulFortune_gameState', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }
  
  /**
   * Load the game state from localStorage
   * @private
   * @returns Loaded game state or null if not found
   */
  private loadStateFromStorage(): GameState | null {
    try {
      const savedState = localStorage.getItem('fruitfulFortune_gameState');
      
      if (savedState) {
        return JSON.parse(savedState) as GameState;
      }
    } catch (error) {
      console.error('Failed to load game state from localStorage:', error);
    }
    
    return null;
  }
}

// Create a singleton instance of the game state manager
export const gameStateManager = new GameStateManagerImpl();
