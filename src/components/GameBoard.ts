import * as PIXI from 'pixi.js';
import { Reel, ReelConfig } from './Reel';
import { GlyphInstance } from '../types/glyphs';
import { GameEventType, WinDetectedEvent } from '../types/events';
import { eventManager, publishEvent } from '../utils/event-system';
import { detectWinningCombinations, transformBoardSymbolsToMatrix } from '../core/winning-patterns';
import { sound } from '@pixi/sound';
import { generateRandomBoard, getBoardColumn } from '../core/board';
import { printBoardToConsole } from '../core/glyphs';
import { MAIN_CONFIG } from '../config';
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
  glyphSize: number;
  
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
  width: MAIN_CONFIG.board.width,
  height: MAIN_CONFIG.board.height,
  rows: MAIN_CONFIG.rows,
  columns: MAIN_CONFIG.columns,
  glyphSize: MAIN_CONFIG.glyphSize,
  symbolSpacing: MAIN_CONFIG.symbolSpacing,
  reelSpacing: MAIN_CONFIG.reelSpacing,
  reelConfig: MAIN_CONFIG.reelConfig
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
  private board: GlyphInstance[][] = [];
  
  /**
   * Constructor
   * @param config Configuration for the game board
   */
  constructor(config: Partial<GameBoardConfig> = {}) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    const boardWidth = MAIN_CONFIG.board.width + 30;
    const boardHeight = MAIN_CONFIG.board.height;    
    const slotFrame = new PIXI.Sprite(PIXI.Assets.get('slots'));
    slotFrame.position.set(
      this.config.width/2 - boardWidth/2-4, 
      this.config.height/2 - boardHeight/2 + MAIN_CONFIG.board.y);
    slotFrame.width = boardWidth;
    slotFrame.height = boardHeight;
    this.addChild(slotFrame);
            
    // Create container for reels
    this.reelsContainer = new PIXI.Container();
    this.addChild(this.reelsContainer);
    
    // Center the reels container
    this.reelsContainer.position.set(
      this.config.width / 2 - (this.config.columns * (this.config.glyphSize + this.config.reelSpacing)) / 2,
      this.config.height / 2 - (this.config.rows * this.config.glyphSize) / 2
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
        width: this.config.glyphSize,
        height: this.config.rows * this.config.glyphSize,
        visibleSymbols: this.config.rows,
        glyphSize: this.config.glyphSize,
        glyphSpacing: this.config.symbolSpacing,
        spinStartDelay: (this.config.reelConfig?.spinStartDelay || 0) + col * 100, // Stagger start
        spinStopDelay: (this.config.reelConfig?.spinStopDelay || 0) + col * 100 // Stagger stop
      };
      
      // Create reel
      const reel = new Reel(col, reelConfig);
      
      // Position reel
      reel.position.x = col * (this.config.glyphSize + this.config.reelSpacing);
      
      // Add to container
      this.reelsContainer.addChild(reel);
      
      // Add to reels array
      this.reels.push(reel);
    }
    
    // Initialize board symbols
    // this.initSymbols();

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
    eventManager.subscribe(GameEventType.SPIN_BUTTON_CLICKED, (_: any) => {
      this.initSymbols();
    })
    eventManager.subscribe(GameEventType.WIN_DETECTED, (event: WinDetectedEvent) => {
      
      this.onWinDetected(event.pattern, event.symbols);
    }

    )

  }
  
  private onWinDetected(pattern: any, symbols: GlyphInstance[]): void {
    console.log("GameBoard: Win detected", pattern, symbols);
    // Highlight winning symbols 
    
    this.highlightWinningSymbols(symbols);
    // Play win sound
    sound.play("win", {
      volume: 0.5,

      complete: () => {
        this.clearWinningHighlights();
      }
    });

    

  }
  /**
   * Handle reel stopped event
   * @param reelIndex Index of the reel that stopped
   * @param symbols Symbols on the stopped reel
   */
  private onReelStopped(reelIndex: number, symbols: GlyphInstance[]): void {
    // Update board symbols for this reel
    this.board[reelIndex] = symbols;
    
    // Increment reels stopped count
    this.reelsStoppedCount++;
    
    // Check if all reels have stopped
    if (this.reelsStoppedCount === this.config.columns) {
      // All reels have stopped
      this.isSpinning = false;
      
      // Publish all reels stopped event
      publishEvent(GameEventType.ALL_REELS_STOPPED, {
        boardSymbols: this.board
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
    
    // Play spin sound
    sound.play("spin");
    
    // Start spinning each reel
    console.log(`GameBoard: Starting to spin ${this.reels.length} reels`);
    for (let i = 0; i < this.reels.length; i++) {
      console.log(`GameBoard: Spinning reel ${i}`);
      this.reels[i].spin();
    }
  }
  
  /**
   * Detect winning combinations
   */
  private detectWins(): void {
    
    console.log("GameBoard: Detecting wins", this.board);
    // // Detect winning combinations
    // const allSymbols = this.reels.map((reel) => reel.getSymbols());
    // printBoardToConsole(transformBoardSymbolsToMatrix(allSymbols));
    // console.log("GameBoard: Detecting wins", this.boardSymbols);
    const board = transformBoardSymbolsToMatrix(this.board);
    printBoardToConsole(board);    
    // console.log("GameBoard: ", board);    
    const winningCombinations = detectWinningCombinations(board);
    
    // If there are winning combinations, highlight them
    if (winningCombinations.length > 0) {
      // Collect all winning symbols
      const winningSymbols: GlyphInstance[] = [];

      var i = 0;
      for (const { pattern, symbols } of winningCombinations) {
   
        winningSymbols.push(...symbols);
        // console.log("GameBoard: Winning symbols detected", symbols);
        // Publish win detected event
        setTimeout(function() {
          publishEvent(GameEventType.WIN_DETECTED, {
            pattern: pattern, // This would be the actual pattern type
            symbols
          });
        }, i*500);
        i++;
      }
      
      // Highlight winning symbols
      // moved to event loop
      // this.highlightWinningSymbols(winningSymbols);
    }
  }
  
  /**
   * Highlight winning symbols
   * @param winningSymbols Array of winning symbols
   */
  private highlightWinningSymbols(winningSymbols: GlyphInstance[]): void {
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
   * Set specific symbols on the board
   * @param symbols 2D array of symbols to set
   */
  public initSymbols(): void {

    this.board = generateRandomBoard(this.config.rows, this.config.columns);
    console.log("GameBoard: Initializing symbols", this.board);
    printBoardToConsole(this.board);
    
    // Set symbols on each reel
    for (let i = 0; i < this.reels.length; i++) {
      const reel = this.reels[i];
      const reelSymbols = getBoardColumn(this.board, i);
      
      // Set symbols on the reel
      reel.setVisibleSymbols(reelSymbols);
    }

  }
  
  /**
   * Get the current board symbols
   * @returns 2D array of symbol instances
   */
  public getSymbols(): GlyphInstance[][] {
    return this.board;
  }
  
  /**
   * Check if the board is currently spinning
   * @returns Whether the board is spinning
   */
  public isCurrentlySpinning(): boolean {
    return this.isSpinning;
  }
  

}
