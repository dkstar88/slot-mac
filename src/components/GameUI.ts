import * as PIXI from 'pixi.js';
import { AnimatedSprite } from 'pixi.js';
import { SpinButton } from './SpinButton';
import { sound } from '@pixi/sound';
import { GameEventType } from '../types/events';
import { eventManager, publishEvent } from '../utils/event-system';
import { IGameState } from '../types/game-state';
import { GameStateManager } from '../state/game-state-manager';
import { MAIN_CONFIG } from '../config';
import { MessagePopup } from './MessagePopup';
import { Coins } from './Coins'
import { GlyphValuesBoard } from './GlyphValuesBoard'
import { CombinationBoard } from './CombinationBoard';
import { Button } from './Button';

/**
 * Configuration for the game UI
 */
export interface GameUIConfig {
  /** Width of the UI */
  width: number;
  
  /** Height of the UI */
  height: number;
  
  /** Background color */
  backgroundColor: number;
  
  /** Text color */
  textColor: number;
  
  /** Font family */
  fontFamily: string;
  
  /** Font size for labels */
  labelFontSize: number;
  
  /** Font size for values */
  valueFontSize: number;
  
  /** Font size for messages */
  messageFontSize: number;
}

/**
 * Default configuration for the game UI
 */
const DEFAULT_CONFIG: GameUIConfig = {
  width: MAIN_CONFIG.width,
  height: MAIN_CONFIG.height,
  backgroundColor: MAIN_CONFIG.backgroundColor,
  textColor: MAIN_CONFIG.textColor,
  fontFamily: '"Gill Sans", sans-serif',
  labelFontSize: MAIN_CONFIG.labelFontSize,
  valueFontSize: MAIN_CONFIG.valueFontSize,
  messageFontSize: MAIN_CONFIG.messageFontSize,
};

/**
 * Game UI component for the slot machine
 */
export class GameUI extends PIXI.Container {
  /** Configuration for the UI */
  private config: GameUIConfig;
  
  /** Spin button */
  // private spinButton!: SpinButton;
  private spinButtons: SpinButton[] = [];
  
  /** Reset button */
  private resetButton!: PIXI.Container;
  
  /** Show popup button */
  private showPopupButton!: PIXI.Container;
  
  /** Coin display */
  private coinDisplay!: Coins;
   
  /** Message display */
  private messageDisplay!: PIXI.Text;
  
  /** Message popup */
  private messagePopup!: MessagePopup;
  
  /** Win amount display */
  private winAmountDisplay!: PIXI.Text;
  
  /** Current game state */
  private gameState: IGameState | null = null;
  
  /** Message timeout ID */
  private messageTimeoutId: number | null = null;
  
  /** Container for coin particles */
  private particleContainer!: PIXI.Container;
  
  /** Container for combinations display */
  private combinationsContainer!: PIXI.Container;
  
  /** Gold coin spritesheet */
  private goldCoinSpritesheet: PIXI.Spritesheet | null = null;
  
  /** PIXI application instance */
  private app: PIXI.Application;
  
  /**
   * Constructor
   * @param app PIXI application instance
   * @param config Configuration for the UI
   */
  constructor(app: PIXI.Application, config: Partial<GameUIConfig> = {}) {
    super();
    this.app = app;
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize UI elements
    this.initUI();
    
    // Initialize particle system
    this.initParticleSystem();
    
    // Initialize combinations display
    this.initCombinationsDisplay();
    
    // Initialize message popup
    this.initMessagePopup();
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize UI elements
   */
  private initUI(): void {

    this.coinDisplay = new Coins({
      fontFamily: this.config.fontFamily,
      fontSize: this.config.valueFontSize,
      textColor: this.config.textColor,
    });
    this.coinDisplay.position.set(20, 20);
    this.addChild(this.coinDisplay);
       
    // Create message display
    this.messageDisplay = new PIXI.Text({
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.valueFontSize,
        fill: this.config.textColor,
        align: 'center',
      }
    }); 
    this.messageDisplay.anchor.set(0.5, 0);
    this.messageDisplay.position.set(this.config.width / 2, 100);
    this.addChild(this.messageDisplay);
    
    // Create win amount display
    this.winAmountDisplay = new PIXI.Text({
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.valueFontSize,
        fill: this.config.textColor,
        align: 'center',
      }
    }); 
    this.winAmountDisplay.anchor.set(0.5, 0);
    this.winAmountDisplay.position.set(this.config.width / 2, 150);
    this.winAmountDisplay.visible = false;
    this.addChild(this.winAmountDisplay);
        
    // Create spin button
    const spinButtonsWidth = (120+10)*5;
    var spinButtonX = this.config.width / 2 - spinButtonsWidth / 2; 
    [1, 2, 3, 5, 10].forEach((bet) => {
      const betBtn = new SpinButton({
        text: "Bet " + bet.toString(),
        bet: bet,
      });
      betBtn.position.set(
        spinButtonX,
        this.config.height - 50 - 20
      );
      this.addChild(betBtn);
      this.spinButtons.push(betBtn);
      spinButtonX += betBtn.width + 10;
    });
    
    // Create reset button
    this.resetButton = this.createResetButton();
    this.resetButton.position.set(
      this.config.width - 100, 
      20
    );
    this.addChild(this.resetButton);
    
    // Create show popup button
    this.showPopupButton = this.createShowPopupButton();
    this.showPopupButton.position.set(
      this.config.width - 200, 
      20
    );
    this.addChild(this.showPopupButton);


    const glyphListContainer = new GlyphValuesBoard({
      width: 180,
      height: 300,
      color: 0x333333,
      fontFamily: this.config.fontFamily,
      fontSize: this.config.valueFontSize,
      textColor: this.config.textColor,
    });
    glyphListContainer.position.set(30, 180);
    this.addChild(glyphListContainer);
    

  }
  
  /**
   * Subscribe to events
   */
  private subscribeToEvents(): void {
    // Subscribe to game state changed event
    eventManager.subscribe(GameEventType.GAME_STATE_CHANGED, (event: any) => {
      this.onGameStateChanged(event.state);
    });
    
    // Subscribe to spin button clicked event
    eventManager.subscribe(GameEventType.SPIN_BUTTON_CLICKED, (event: any) => {
      this.onSpinButtonClicked(event.bet);
    });
    
    // Subscribe to spin started event
    eventManager.subscribe(GameEventType.SPIN_STARTED, () => {      
      this.hideWinAmount();
    });
    
    // Subscribe to payout calculated event
    eventManager.subscribe(GameEventType.PAYOUT_CALCULATED, (event: any) => {
      this.onPayoutCalculated(event.amount);
    });
    
    // Subscribe to celebration started event
    eventManager.subscribe(GameEventType.CELEBRATION_STARTED, () => {
      this.showMessage('Winner!');
    });
    
    // Subscribe to celebration ended event
    eventManager.subscribe(GameEventType.CELEBRATION_ENDED, () => {
      this.clearMessage();
    });
  }
  
  /**
   * Handle game state changed event
   * @param state New game state
   */
  private onGameStateChanged(state: IGameState): void {

    console.log("GameUI: onGameStateChanged called", state);
    this.gameState = state;
    
    // Update UI elements
    this.updateUI();
    
    // Update spin button state
    this.spinButtons.forEach((spinButton) => {
      spinButton.updateFromGameState(state.currentState);
    });
    
  }
  
  /**
   * Handle spin button clicked event
   */
  private onSpinButtonClicked(bet: number): void {
    // Check if can spin
    if (!this.gameState || !this.gameState.canSpin) {
      return;
    }
    
    // Publish spin started event
    publishEvent(GameEventType.SPIN_STARTED, {
      currentCoins: this.gameState.playerStats.coins,
      spinCost: bet
    });
  }
  
  /**
   * Handle payout calculated event
   * @param amount Payout amount
   * @param multiplier Multiplier applied
   */
  private onPayoutCalculated(amount: number): void {
    if (amount > 0) {
      // Emit gold coins based on payout amount
      this.emitGoldCoins(amount);
      var soundSec = 1;
      if (amount < 5) {
        soundSec = 1;
      } else if (amount < 10) {
        soundSec = 2;
      } else if (amount < 20) {
        soundSec = 3;
      } else if (amount < 50) {
        soundSec = 4;
      }      
      sound.play("payout" + soundSec);
      this.showWinAmount(amount);
      this.showMessage(`You won ${amount} coins!`);
    } else {
      this.showMessage('Try again!');
    }
  }
  
  /**
   * Update UI elements based on game state
   */
  private updateUI(): void {
    if (!this.gameState) return;
    
    // Update coin display
    this.coinDisplay.setCoins(this.gameState.playerStats.coins);
    this.coinDisplay.setMultiplier(this.gameState.currentMultiplier);
    
  }
  
  /**
   * Initialize message popup
   */
  private initMessagePopup(): void {
    // Create message popup
    this.messagePopup = new MessagePopup(this.app);
  }
  
  /**
   * Show a message
   * @param message Message to show
   * @param duration Duration to show the message (ms), 0 for indefinite
   * @param usePopup Whether to use the popup dialog (true) or simple text display (false)
   */
  public showMessage(message: string, duration: number = 0, usePopup: boolean = false): void {
    if (usePopup) {
      // Show message in popup
      this.messagePopup.show(message, () => {
        // This callback is called when the popup is closed
        if (this.messageTimeoutId !== null) {
          clearTimeout(this.messageTimeoutId);
          this.messageTimeoutId = null;
        }
      });
      
      // If duration is specified, close the popup after the duration
      if (duration > 0) {
        this.messageTimeoutId = window.setTimeout(() => {
          this.messagePopup.close();
          this.messageTimeoutId = null;
        }, duration);
      }
    } else {
      // Show message in simple text display (original behavior)
      // Clear any existing timeout
      if (this.messageTimeoutId !== null) {
        clearTimeout(this.messageTimeoutId);
        this.messageTimeoutId = null;
      }
      
      // Set message text
      this.messageDisplay.text = message;
      this.messageDisplay.visible = true;
      
      // If duration is specified, clear the message after the duration
      if (duration > 0) {
        this.messageTimeoutId = window.setTimeout(() => {
          this.clearMessage();
          this.messageTimeoutId = null;
        }, duration);
      }
    }
  }
  
  /**
   * Show a message in a popup dialog
   * @param message Message to show
   * @param duration Duration to show the message (ms), 0 for indefinite
   */
  public showPopupMessage(message: string, duration: number = 0): void {
    this.showMessage(message, duration, true);
  }
  
  /**
   * Clear the message
   */
  public clearMessage(): void {
    this.messageDisplay.text = '';
    this.messageDisplay.visible = false;
    this.messagePopup.close();
  }
  
  /**
   * Show win amount
   * @param amount Win amount
   */
  public showWinAmount(amount: number): void {
    this.winAmountDisplay.text = `+${amount}`;
    this.winAmountDisplay.visible = true;
    
    // Animate the win amount
    this.animateWinAmount();
  }
  
  /**
   * Hide win amount
   */
  public hideWinAmount(): void {
    this.winAmountDisplay.visible = false;
    
    // Reset scale and alpha
    this.winAmountDisplay.scale.set(1);
    this.winAmountDisplay.alpha = 1;
  }
  
  /**
   * Animate the win amount
   */
  private animateWinAmount(): void {
    // Reset scale and alpha
    this.winAmountDisplay.scale.set(1);
    this.winAmountDisplay.alpha = 1;
    
    // Create animation
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    // Use PixiJS ticker for animation
    const animate = (_: PIXI.Ticker) => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Scale up and fade out
      this.winAmountDisplay.scale.set(1 + progress * 0.5);
      this.winAmountDisplay.alpha = 1 - progress;
      
      // If animation is complete, remove from ticker
      if (progress >= 1) {
        PIXI.Ticker.shared.remove(animate);
        this.winAmountDisplay.visible = false;
      }
    };
    
    // Add to ticker
    PIXI.Ticker.shared.add(animate);
  }
  
  /**
   * Create a show popup button
   * @returns Show popup button container
   */
  private createShowPopupButton(): PIXI.Container {

    
    const button = new Button( {
      width: 80,
      height: 30,
      text: 'POPUP',
      fontFamily: this.config.fontFamily,
      fontSize: this.config.labelFontSize,
      textColor: 0xffffff,
      color: 0x00aa00,
      hoverColor: 0x00cc00,
      downColor: 0x008800,
      onClicked: () => this.onShowPopupButtonClicked()
    })
    return button;

  }
  
  /**
   * Handle show popup button clicked event
   */
  private onShowPopupButtonClicked(): void {
    console.log("Show popup button clicked");
    this.showPopupMessage('This is a popup message with a close button!');
  }
  
  /**
   * Create a reset button
   * @returns Reset button container
   */
  private createResetButton(): PIXI.Container {

    const button = new Button( {
      width: 80,
      height: 30,
      text: 'RESET',
      fontFamily: this.config.fontFamily,
      fontSize: this.config.labelFontSize,
      textColor: 0xffffff,
      onClicked: () => this.onResetButtonClicked()
    })
    return button;
  }
  
  /**
   * Handle reset button clicked event
   */
  private onResetButtonClicked(): void {
    GameStateManager.resetState();
    this.showMessage('Game Restart!');
  }
  
  /**
   * Initialize the combinations display on the right side of the screen
   */
  private initCombinationsDisplay(): void {
    // Create container for combinations display
    this.combinationsContainer = new CombinationBoard({
      width: 200,
      height: 400,
      color: 0x333333,
      fontFamily: this.config.fontFamily,
      fontSize: this.config.valueFontSize*0.8,
      textColor: this.config.textColor,
    });
    this.combinationsContainer.position.set(this.config.width - 220, 180);
    
    // Add combinations container to main UI
    this.addChild(this.combinationsContainer);
  }

  /**
   * Initialize the particle system
   */
  private initParticleSystem(): void {
    // Create container for particles
    const layer = new PIXI.RenderLayer();
    this.addChild(layer);
    this.particleContainer = new PIXI.Container();
    this.particleContainer.zIndex = 999; // Ensure it's above the background
    layer.attach(this.particleContainer);
    this.addChild(this.particleContainer);
    
    // Get the gold coin spritesheet data
    const goldAnimResource = PIXI.Assets.get('goldAnim');
    if (goldAnimResource) {
      // The spritesheet should already be loaded and parsed by PIXI.Assets
      this.goldCoinSpritesheet = goldAnimResource;
    }
  }
  
  /**
   * Emit gold coins based on payout amount
   * @param amount Number of coins to emit
   */
  private emitGoldCoins(amount: number): void {
    if (!this.goldCoinSpritesheet) return;
    
    // Calculate number of coins to emit (cap at a reasonable maximum)
    const numCoins = Math.min(amount, 50);
    
    // Get the center position of the game board
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    
    // Create and emit coins
    for (let i = 0; i < numCoins; i++) {
      // Create animated sprite from spritesheet
      const frameNames = [
        'gold_1.png',
        'gold_2.png',
        'gold_3.png',
        'gold_4.png',
        'gold_5.png',
        'gold_6.png'
      ];
      
      // Get textures from the spritesheet
      const frames = frameNames.map(name => {
        const texture = PIXI.Texture.from(name);
        return texture;
      });
      
      const coin = new AnimatedSprite(frames);
      
      // Set coin properties
      coin.anchor.set(0.5);
      coin.scale.set(0.5 + Math.random() * 0.5); // Random size
      coin.animationSpeed = 0.2 + Math.random() * 0.1; // Random animation speed
      coin.loop = true;
      
      // Set initial position (slightly randomized around center)
      coin.position.set(
        centerX + (Math.random() - 0.5) * 100,
        centerY + (Math.random() - 0.5) * 100
      );
      
      // Set random velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 5; // Initial upward velocity
      
      // Add to container
      this.particleContainer.addChild(coin);
      
      // Start animation
      coin.play();
      
      // Create animation
      const startTime = Date.now();
      const duration = 1000 + Math.random() * 1000; // Random duration
      
      // Use PixiJS ticker for animation
      const animate = (_: PIXI.Ticker) => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        // Apply gravity
        coin.position.x += vx;
        coin.position.y += vy + progress * 10; // Increasing downward velocity
        
        // Spin the coin
        coin.rotation += 0.1;
        
        // If animation is complete or coin is off-screen, remove it
        if (progress >= 1 || 
            coin.position.y > this.config.height + 50 ||
            coin.position.x < -50 ||
            coin.position.x > this.config.width + 50) {
          PIXI.Ticker.shared.remove(animate);
          this.particleContainer.removeChild(coin);
          coin.destroy();
        }
      };
      
      // Add to ticker
      PIXI.Ticker.shared.add(animate);
    }
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Clear any existing timeout
    if (this.messageTimeoutId !== null) {
      clearTimeout(this.messageTimeoutId);
      this.messageTimeoutId = null;
    }
    
    // Destroy spin button
    this.spinButtons.forEach((spinButton) => {
      spinButton.destroy();
    });
    
    // Destroy particle container
    if (this.particleContainer) {
      this.particleContainer.destroy({ children: true });
    }
    
    // Destroy combinations container
    if (this.combinationsContainer) {
      this.combinationsContainer.destroy({ children: true });
    }
    
    // Destroy message popup
    if (this.messagePopup) {
      this.messagePopup.destroy();
    }
    
    // Call parent destroy
    super.destroy({ children: true });
  }
}
