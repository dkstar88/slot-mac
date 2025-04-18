import * as PIXI from 'pixi.js';
import { GameBoard } from './components/GameBoard';
import { GameUI } from './components/GameUI';
import { GameStateManager } from './state/game-state-manager';
import { eventManager, publishEvent } from './utils/event-system';
import { GameEventType } from './types/events';
import { GameStateType } from './types/game-state';
import { SYMBOLS_ARRAY } from './core/symbols';
import { detectWins, calculatePayout } from './core/winning-patterns';

/**
 * Game configuration
 */
const CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  rows: 3,
  columns: 5,
  symbolSize: 100,
  reelSpacing: 10
};

/**
 * Main game class
 */
class FruitfulFortune {
  // PixiJS application
  private app: PIXI.Application;
  
  // Game components
  private gameBoard!: GameBoard;
  private gameUI!: GameUI;
  
  // Assets loaded flag
  // private assetsLoaded: boolean = false;
  
  /**
   * Constructor
   */
  constructor() {
    // Create a canvas element manually
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;
    
    // Create PixiJS application and initialize it
    this.app = new PIXI.Application();
    this.app.init({
      width: CONFIG.width,
      height: CONFIG.height,
      backgroundColor: CONFIG.backgroundColor,
      antialias: true,
      view: canvas
    });
    
    // Add the canvas to the pixi-container
    const pixiContainer = document.getElementById('pixi-container');
    if (pixiContainer) {
      pixiContainer.appendChild(canvas);
    } else {
      console.error('Could not find pixi-container element');
      document.body.appendChild(canvas);
    }

    // Load assets
    this.initGame();
  }
  
  /**
   * Load game assets
   */
  // private loadAssets(): void {
  //   // Create a loader
  //   const loader = PIXI.Assets;
        
  //   // Add symbol textures to load
  //   const symbolsAssets = []
    
  //   console.log('Loading symbol textures:', symbolsAssets);
    
  //   // Create a promise for each texture to load
  //   const loadPromises = symbolsAssets.map(asset => {
  //     return loader.load(asset)
  //       .then(texture => {
  //         console.log(`Successfully loaded texture: ${asset.src}`);
  //         return { asset, texture, success: true };
  //       })
  //       .catch(error => {
  //         console.error(`Failed to load texture: ${asset.src}`, error);
  //         return { asset, error, success: false };
  //       });
  //   });
    
  //   // Wait for all textures to load (or fail)
  //   Promise.all(loadPromises)
  //     .then(results => {
        

  //       const successCount = results.filter(r => r.success).length;
  //       const failCount = results.length - successCount;
        
  //       console.log(`Asset loading complete. Success: ${successCount}, Failed: ${failCount}`);
        
  //       if (failCount > 0) {
  //         console.warn('Some assets failed to load. The game will use fallback graphics for these.');
  //       }
        
  //       // this.assetsLoaded = true;
  //       this.initGame();
        
  //       // Hide loading screen
  //       const loadingScreen = document.getElementById('loading-screen');
  //       if (loadingScreen) {
  //         loadingScreen.style.display = 'none';
  //       }
  //     });
  // }
  

  private hideLoadingScreen(): void {
      // Hide loading screen
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
  }

  /**
   * Initialize the game
   */
  private initGame(): void {


    this.hideLoadingScreen();

    // Create game board
    this.gameBoard = new GameBoard({
      width: CONFIG.width,
      height: CONFIG.height, // Leave space for UI
      rows: CONFIG.rows,
      columns: CONFIG.columns,
      symbolSize: CONFIG.symbolSize,
      reelSpacing: CONFIG.reelSpacing
    });
    this.gameBoard.position.set(0, 0);
    this.app.stage.addChild(this.gameBoard);
    
    // Create game UI
    this.gameUI = new GameUI({
      width: CONFIG.width,
      height: CONFIG.height
    });
    this.app.stage.addChild(this.gameUI);
    
    // Subscribe to events
    this.subscribeToEvents();
    
    // Add keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && GameStateManager.getState().currentState === GameStateType.IDLE) {
        publishEvent(GameEventType.SPIN_BUTTON_CLICKED, {});
      }
    });
    
    // Show welcome message
    this.gameUI.showMessage('Welcome to Fruitful Fortune!', 3000);
    GameStateManager.resetState(); // Reset game state on initialization
  }
  
  /**
   * Subscribe to events
   */
  private subscribeToEvents(): void {
    // Subscribe to spin button clicked event
    eventManager.subscribe(GameEventType.SPIN_BUTTON_CLICKED, () => {
      this.onSpinButtonClicked();
    });
    
    // Subscribe to all reels stopped event
    eventManager.subscribe(GameEventType.ALL_REELS_STOPPED, (event: any) => {
      this.onAllReelsStopped(event.boardSymbols);
    });
  }
  
  /**
   * Handle spin button clicked event
   */
  private onSpinButtonClicked(): void {
    console.log("Main: onSpinButtonClicked called");
    
    // Check if can spin
    const gameState = GameStateManager.getState();
    if (gameState.currentState !== GameStateType.IDLE || !gameState.canSpin) {
      console.log("Main: Cannot spin, gameState:", gameState.currentState, "canSpin:", gameState.canSpin);
      return;
    }
    
    // Start spin
    GameStateManager.startSpin();
    
    // Start spinning the reels
    console.log("Main: Starting to spin reels");
    this.gameBoard.spin();
  }
  
  /**
   * Handle all reels stopped event
   * @param boardSymbols Symbols on the board
   */
  private onAllReelsStopped(boardSymbols: any[][]): void {
    console.log("Main: All reels stopped, boardSymbols:", boardSymbols);
    // Create spin result
    let spinResult = {
      boardSymbols,
      wins: detectWins(boardSymbols), // This would be populated by the winning combinations detector
      totalPayout: 0, // This would be calculated based on the wins
      isJackpot: false // This would be determined based on the wins
    };
    spinResult.totalPayout = spinResult.wins.reduce((acc, win) => acc + win.totalValue, 0);
    // End spin
    GameStateManager.endSpin(spinResult);
  }
}

// Create and start the game when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new FruitfulFortune();
});
