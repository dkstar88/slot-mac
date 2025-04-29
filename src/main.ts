import * as PIXI from 'pixi.js';
import { GameBoard } from './components/GameBoard';
import { GameUI } from './components/GameUI';
import { GameStateManager } from './state/game-state-manager';
import { eventManager } from './utils/event-system';
import { GameEventType } from './types/events';
import { GameStateType } from './types/game-state';
import { detectWins, calculatePayout } from './core/winning-patterns';
import { loadAllAssets } from './assets';
import { GameBackground } from './components/GameBackground';
import { MenuScene } from './components/MenuScene';
import { HighScoresScene } from './components/HighScoresScene';
import { Button } from './components/Button';
import { MAIN_CONFIG } from './config';
/**
 * Game configuration
 */
const CONFIG = {
  width: MAIN_CONFIG.width,
  height: MAIN_CONFIG.height,
  backgroundColor: MAIN_CONFIG.backgroundColor,
  rows: MAIN_CONFIG.rows,
  columns: MAIN_CONFIG.columns,
  glyphSize: MAIN_CONFIG.glyphSize,
  reelSpacing: MAIN_CONFIG.reelSpacing,};

/**
 * Main game class
 */
class FruitfulFortune {
  // PixiJS application
  private app: PIXI.Application;
  
  // Game components
  private gameBoard!: GameBoard;
  private gameUI!: GameUI;
  private gameBackground!: GameBackground;
  private menuScene!: MenuScene;
  private highScoresScene!: HighScoresScene;
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
      useBackBuffer: true,
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
    this.loadAssets();
  }
  
  /**
   * Load game assets
   */
  private loadAssets(): void {
    
    const loadPromises = loadAllAssets();
    
    // Wait for all textures to load (or fail)
    Promise.all(loadPromises)
      .then(results => {
        

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        
        console.log(`Asset loading complete. Success: ${successCount}, Failed: ${failCount}`);
        
        if (failCount > 0) {
          console.warn('Some assets failed to load. The game will use fallback graphics for these.');
        }
        
        // this.assetsLoaded = true;
        this.initGame();
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
          loadingScreen.style.display = 'none';
        }
      });
  }
  

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

    // Create game background
    this.gameBackground = new GameBackground({
      width: CONFIG.width,
      height: CONFIG.height
    });
    this.app.stage.addChild(this.gameBackground);

    // Create menu scene
    this.menuScene = new MenuScene({
      width: CONFIG.width,
      height: CONFIG.height
    });
    this.app.stage.addChild(this.menuScene);

    // Create high scores scene
    this.highScoresScene = new HighScoresScene({
      width: CONFIG.width,
      height: CONFIG.height
    });
    this.app.stage.addChild(this.highScoresScene);
    this.highScoresScene.hide(); // Hide initially

    // Create game board
    this.gameBoard = new GameBoard({
      width: CONFIG.width,
      height: CONFIG.height, // Leave space for UI
      rows: CONFIG.rows,
      columns: CONFIG.columns,
      glyphSize: CONFIG.glyphSize,
      reelSpacing: CONFIG.reelSpacing
    });
    this.gameBoard.position.set(MAIN_CONFIG.board.x, MAIN_CONFIG.board.y);
    this.app.stage.addChild(this.gameBoard);
    this.gameBoard.visible = false; // Hide initially
    
    // Create game UI
    this.gameUI = new GameUI(this.app, {
      width: CONFIG.width,
      height: CONFIG.height
    });
    this.app.stage.addChild(this.gameUI);
    this.gameUI.visible = false; // Hide initially
    
    // Subscribe to events
    this.subscribeToEvents();
    
    // Set initial game state to MENU
    GameStateManager.setState({
      currentState: GameStateType.MENU
    });
  }
  
  /**
   * Subscribe to events
   */
  private subscribeToEvents(): void {
    // Subscribe to spin button clicked event
    eventManager.subscribe(GameEventType.SPIN_BUTTON_CLICKED, (event: any) => {
      this.onSpinButtonClicked(event.bet);
    });
    
    // Subscribe to all reels stopped event
    eventManager.subscribe(GameEventType.ALL_REELS_STOPPED, (event: any) => {
      this.onAllReelsStopped(event.boardSymbols);
    });

    eventManager.subscribe(GameEventType.GAMEOVER, (event: any) => {
      this.onGameover(event.balance);
    });

    // Subscribe to menu events
    eventManager.subscribe(GameEventType.MENU_NEW_GAME, () => {
      this.startNewGame();
    });

    eventManager.subscribe(GameEventType.MENU_SANDBOX, () => {
      this.startSandboxGame();
    });

    eventManager.subscribe(GameEventType.MENU_HIGH_SCORES, () => {
      this.showHighScores();
    });

    eventManager.subscribe(GameEventType.MENU_QUIT, () => {
      this.quitGame();
    });

    // Subscribe to game state changes
    eventManager.subscribe(GameEventType.GAME_STATE_CHANGED, (event: any) => {
      this.onGameStateChanged(event.state);
    });
  }

  /**
   * Handle game state changes
   */
  private onGameStateChanged(state: any): void {
    // Update UI based on game state
    switch (state.currentState) {
      case GameStateType.MENU:
        this.menuScene.show();
        this.highScoresScene.hide();
        this.gameBoard.visible = false;
        this.gameUI.visible = false;
        break;
      case GameStateType.IDLE:
      case GameStateType.SPINNING:
      case GameStateType.EVALUATING:
      case GameStateType.CELEBRATING:
        this.menuScene.hide();
        this.highScoresScene.hide();
        this.gameBoard.visible = true;
        this.gameUI.visible = true;
        break;
      case GameStateType.GAMEOVER:
        // Game over state is handled by the onGameover method
        this.menuScene.hide();
        this.highScoresScene.hide();
        this.gameBoard.visible = true;
        this.gameUI.visible = true;
        break;
    }
  }

  /**
   * Start a new game with default coins
   */
  private startNewGame(): void {
    GameStateManager.resetState(); // Reset to default state
    GameStateManager.setState({
      currentState: GameStateType.IDLE
    });
    this.gameUI.showMessage('Welcome to Fruitful Fortune!', 3000);
  }

  /**
   * Start a sandbox game with lots of coins
   */
  private startSandboxGame(): void {
    GameStateManager.resetState(); // Reset to default state
    GameStateManager.setState({
      currentState: GameStateType.IDLE,
      playerStats: {
        ...GameStateManager.getState().playerStats,
        coins: 99999
      }
    });
    this.gameUI.showMessage('Sandbox Mode: 99999 coins!', 3000);
  }

  /**
   * Show high scores screen
   */
  private showHighScores(): void {
    this.menuScene.hide();
    this.highScoresScene.show();
  }

  /**
   * Quit the game
   */
  private quitGame(): void {
    // Save any necessary data
    GameStateManager.saveState();
    
    // Show confirmation message
    this.gameUI.showMessage('Thanks for playing!', 3000);
    
    // In a web context, we can't actually quit the application,
    // but we can return to the menu
    setTimeout(() => {
      GameStateManager.setState({
        currentState: GameStateType.MENU
      });
    }, 3000);
  }
  

  private onGameover(balance: number)
  {
    // Get player stats
    const playerStats = GameStateManager.getState().playerStats;
    
    // Calculate total coins spent (totalSpins - totalWins + starting coins - current coins)
    const startingCoins = MAIN_CONFIG.game.starting_coins;
    const totalCoinsSpent = playerStats.totalSpins - playerStats.totalWins + startingCoins - playerStats.coins;
    
    // Show game over message with player stats
    const statsMessage = `
Game Over!

PLAYER STATS:
Final Score: ${playerStats.coins} coins
Total Spins: ${playerStats.totalSpins}
Total Wins: ${playerStats.totalWins}
Largest Win: ${playerStats.largestWin}
Total Coins Spent: ${totalCoinsSpent}
`;
    
    this.gameUI.showPopupMessage(statsMessage, 0);
    
    // Add buttons to the popup
    const saveScoreButton = new Button({
      width: 150,
      height: 40,
      text: 'Save Score',
      fontFamily: '"Gill Sans", sans-serif',
      fontSize: 18,
      textColor: 0xFFFFFF,
      color: 0x4CAF50, // Green
      hoverColor: 0x66BB6A,
      downColor: 0x388E3C,
      onClicked: () => {
        // Prompt for player name
        const playerName = prompt('Enter your name:', 'Player') || 'Player';
        
        // Save high score
        this.highScoresScene.addHighScore(playerName, GameStateManager.getState().playerStats.coins);
        
        // Close popup and return to menu
        this.gameUI.messagePopup.close();
        GameStateManager.returnToMenu();
      }
    });
    
    const menuButton = new Button({
      width: 150,
      height: 40,
      text: 'Return to Menu',
      fontFamily: '"Gill Sans", sans-serif',
      fontSize: 18,
      textColor: 0xFFFFFF,
      color: 0xF44336, // Red
      hoverColor: 0xEF5350,
      downColor: 0xD32F2F,
      onClicked: () => {
        // Close popup and return to menu
        this.gameUI.messagePopup.close();
        GameStateManager.returnToMenu();
      }
    });
    
    // Position buttons
    saveScoreButton.position.set(
      this.gameUI.messagePopup.width / 2 - 160,
      this.gameUI.messagePopup.height - 60
    );
    
    menuButton.position.set(
      this.gameUI.messagePopup.width / 2 + 10,
      this.gameUI.messagePopup.height - 60
    );
    
    // Add buttons to popup
    this.gameUI.messagePopup.addToPopup(saveScoreButton);
    this.gameUI.messagePopup.addToPopup(menuButton);
  }
  /**
   * Handle spin button clicked event
   */
  private onSpinButtonClicked(bet: number): void {
    console.log("Main: onSpinButtonClicked called");
    
    // Check if can spin
    const gameState = GameStateManager.getState();
    if (gameState.currentState !== GameStateType.IDLE || !gameState.canSpin) {
      console.log("Main: Cannot spin, gameState:", gameState.currentState, "canSpin:", gameState.canSpin);
      return;
    }
    
    // Start spin
    GameStateManager.startSpin(bet);
    
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
    spinResult.totalPayout = calculatePayout(spinResult.wins, GameStateManager.getState().currentMultiplier);
    // End spin
    GameStateManager.endSpin(spinResult);
  }
}

// Create and start the game when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new FruitfulFortune();
});
