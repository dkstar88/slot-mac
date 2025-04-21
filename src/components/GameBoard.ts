import * as PIXI from 'pixi.js';
import { Reel, ReelConfig } from './Reel';
import { Symbol, SymbolInstance } from '../types/symbols';
import { GameEventType } from '../types/events';
import { eventManager, publishEvent } from '../utils/event-system';
import { detectWinningCombinations, transformBoardSymbolsToMatrix } from '../core/winning-patterns';

/**
 * Configuration for the game board
 */
export interface GameBoardConfig {
  /** Width of the game board */
  width: number;
  
  /** Height of the game board */
  height: number;
  
  /** Number of rows */
  rows: number;
  
  /** Number of columns */
  columns: number;
  
  /** Size of each symbol */
  symbolSize: number;
  
  /** Spacing between symbols */
  symbolSpacing: number;
  
  /** Spacing between reels */
  reelSpacing: number;
  
  /** Configuration for the reels */
  reelConfig?: Partial<ReelConfig>;
}

/**
 * Default configuration for the game board
 */
const DEFAULT_CONFIG: GameBoardConfig = {
  width: 550,
  height: 350,
  rows: 3,
  columns: 5,
  symbolSize: 100,
  symbolSpacing: 0,
  reelSpacing: 10,
  reelConfig: {
    spinDuration: 2000,
    spinStartDelay: 0,
    spinStopDelay: 0
  }
};

/**
 * Game board component for the slot machine
 */
export class GameBoard extends PIXI.Container {
  /** Configuration for the game board */
  private config: GameBoardConfig;
  
  /** Container for the reels */
  private reelsContainer: PIXI.Container;
  
  /** Array of reels */
  private reels: Reel[] = [];
  
  /** Whether the board is currently spinning */
  private isSpinning: boolean = false;
  
  /** Number of reels that have stopped */
  private reelsStoppedCount: number = 0;
  
  /** Current board symbols */
  private boardSymbols: SymbolInstance[][] = [];
  
  /**
   * Constructor
   * @param config Configuration for the game board
   */
  constructor(config: Partial<GameBoardConfig> = {}) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Create container for reels
    this.reelsContainer = new PIXI.Container();
    this.addChild(this.reelsContainer);
    
    // Center the reels container
    this.reelsContainer.position.set(
      this.config.width / 2 - (this.config.columns * (this.config.symbolSize + this.config.reelSpacing)) / 2,
      this.config.height / 2 - (this.config.rows * this.config.symbolSize) / 2
    );
    
    // Initialize reels
    this.initReels();
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize reels
   */
  private initReels(): void {
    // Clear existing reels
    this.reelsContainer.removeChildren();
    this.reels = [];
    
    // Create reels
    for (let col = 0; col < this.config.columns; col++) {
      // Create reel configuration
      const reelConfig: Partial<ReelConfig> = {
        ...this.config.reelConfig,
        width: this.config.symbolSize,
        height: this.config.rows * this.config.symbolSize,
        visibleSymbols: this.config.rows,
        symbolSize: this.config.symbolSize,
        symbolSpacing: this.config.symbolSpacing,
        spinStartDelay: (this.config.reelConfig?.spinStartDelay || 0) + col * 100, // Stagger start
        spinStopDelay: (this.config.reelConfig?.spinStopDelay || 0) + col * 100 // Stagger stop
      };
      
      // Create reel
      const reel = new Reel(col, reelConfig);
      
      // Position reel
      reel.position.x = col * (this.config.symbolSize + this.config.reelSpacing);
      
      // Add to container
      this.reelsContainer.addChild(reel);
      
      // Add to reels array
      this.reels.push(reel);
    }
    
    // Initialize board symbols
    this.updateBoardSymbols();

    // Detect winning combinations
    // const allSymbols = this.reels.map((reel) => reel.getSymbols());
    // printBoardToConsole(transformBoardSymbolsToMatrix(allSymbols));

  }
  
  /**
   * Subscribe to events
   */
  private subscribeToEvents(): void {
    // Subscribe to reel stopped event
    eventManager.subscribe(GameEventType.REEL_STOPPED, (event: any) => {
      this.onReelStopped(event.reelIndex, event.symbols);
    });
  }
  
  /**
   * Handle reel stopped event
   * @param reelIndex Index of the reel that stopped
   * @param symbols Symbols on the stopped reel
   */
  private onReelStopped(reelIndex: number, symbols: SymbolInstance[]): void {
    // Update board symbols for this reel
    this.boardSymbols[reelIndex] = symbols;
    
    // Increment reels stopped count
    this.reelsStoppedCount++;
    
    // Check if all reels have stopped
    if (this.reelsStoppedCount === this.config.columns) {
      // All reels have stopped
      this.isSpinning = false;
      
      // Publish all reels stopped event
      publishEvent(GameEventType.ALL_REELS_STOPPED, {
        boardSymbols: this.boardSymbols
      });
      
      // Detect winning combinations
      this.detectWins();
    }
  }
  
  /**
   * Start spinning the reels
   */
  public spin(): void {
    console.log("GameBoard: spin called");
    
    if (this.isSpinning) {
      console.log("GameBoard: Already spinning, ignoring spin call");
      return;
    }
    
    // Set spinning flag
    this.isSpinning = true;
    
    // Reset reels stopped count
    this.reelsStoppedCount = 0;
    
    // Clear any winning highlights
    this.clearWinningHighlights();
    
    // Start spinning each reel
    console.log(`GameBoard: Starting to spin ${this.reels.length} reels`);
    for (let i = 0; i < this.reels.length; i++) {
      console.log(`GameBoard: Spinning reel ${i}`);
      this.reels[i].spin();
    }
  }
  
  // /**
  //  * Stop spinning the reels
  //  * @param targetSymbols Optional target symbols for each reel
  //  */
  // public stopSpin(targetSymbols?: Symbol[][]): void {
  //   if (!this.isSpinning) return;
    
  //   // Stop each reel
  //   for (let i = 0; i < this.reels.length; i++) {
  //     const reel = this.reels[i];
  //     const reelTargetSymbols = targetSymbols ? targetSymbols[i] : undefined;
      
  //     // Stop the reel
  //     reel.stopSpin(reelTargetSymbols);
  //   }
  // }
  
  /**
   * Detect winning combinations
   */
  private detectWins(): void {
    
    console.log("GameBoard: Detecting wins", this.boardSymbols);
    // // Detect winning combinations
    // const allSymbols = this.reels.map((reel) => reel.getSymbols());
    // printBoardToConsole(transformBoardSymbolsToMatrix(allSymbols));
    // console.log("GameBoard: Detecting wins", this.boardSymbols);
    const board = transformBoardSymbolsToMatrix(this.boardSymbols);
    // printBoardToConsole(board);    
    // console.log("GameBoard: ", board);    
    const winningCombinations = detectWinningCombinations(board);
    
    // If there are winning combinations, highlight them
    if (winningCombinations.length > 0) {
      // Collect all winning symbols
      const winningSymbols: SymbolInstance[] = [];

      for (const { symbols } of winningCombinations) {
   
        winningSymbols.push(...symbols);
        // console.log("GameBoard: Winning symbols detected", symbols);
        // Publish win detected event
        publishEvent(GameEventType.WIN_DETECTED, {
          pattern: { type: 'win' } as any, // This would be the actual pattern type
          symbols
        });
      }
      
      // Highlight winning symbols
      this.highlightWinningSymbols(winningSymbols);
    }
  }
  
  /**
   * Highlight winning symbols
   * @param winningSymbols Array of winning symbols
   */
  private highlightWinningSymbols(winningSymbols: SymbolInstance[]): void {
    // Highlight winning symbols on each reel
    for (const reel of this.reels) {
      reel.highlightWinningSymbols(winningSymbols);
    }
  }
  
  /**
   * Clear winning symbol highlights
   */
  private clearWinningHighlights(): void {
    // Clear highlights on each reel
    for (const reel of this.reels) {
      reel.clearWinningHighlights();
    }
  }
  
  /**
   * Update the board symbols
   */
  private updateBoardSymbols(): void {
    // Initialize board symbols array
    this.boardSymbols = [];
    
    // Get symbols from each reel
    for (const reel of this.reels) {
      this.boardSymbols.push(reel.getVisibleSymbols());
    }
  }
  
  /**
   * Set specific symbols on the board
   * @param symbols 2D array of symbols to set
   */
  public setSymbols(symbols: Symbol[][]): void {
    // Check if dimensions match
    if (symbols.length !== this.config.columns) {
      throw new Error(`Expected ${this.config.columns} columns, got ${symbols.length}`);
    }
    
    // Set symbols on each reel
    for (let i = 0; i < this.reels.length; i++) {
      const reel = this.reels[i];
      const reelSymbols = symbols[i];
      
      // Check if row count matches
      if (reelSymbols.length !== this.config.rows) {
        throw new Error(`Expected ${this.config.rows} rows in column ${i}, got ${reelSymbols.length}`);
      }
      
      // Set symbols on the reel
      reel.setVisibleSymbols(reelSymbols);
    }
    
    // Update board symbols
    this.updateBoardSymbols();
  }
  
  /**
   * Get the current board symbols
   * @returns 2D array of symbol instances
   */
  public getSymbols(): SymbolInstance[][] {
    return this.boardSymbols;
  }
  
  /**
   * Check if the board is currently spinning
   * @returns Whether the board is spinning
   */
  public isCurrentlySpinning(): boolean {
    return this.isSpinning;
  }
  

}
