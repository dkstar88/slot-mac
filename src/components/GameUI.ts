import * as PIXI from 'pixi.js';
import { SpinButton } from './SpinButton';
import { SYMBOLS_ARRAY } from '../core/symbols';
import { Symbol } from '../types/symbols';
import { sound } from '@pixi/sound';
import { GameEventType } from '../types/events';
import { eventManager, publishEvent } from '../utils/event-system';
import { IGameState } from '../types/game-state';
import { GameStateManager } from '../state/game-state-manager';

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
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  textColor: 0xffffff,
  fontFamily: 'Arial',
  labelFontSize: 16,
  valueFontSize: 24,
  messageFontSize: 32
};

/**
 * Game UI component for the slot machine
 */
export class GameUI extends PIXI.Container {
  /** Configuration for the UI */
  private config: GameUIConfig;
  
  /** Spin button */
  private spinButton!: SpinButton;
  
  /** Reset button */
  private resetButton!: PIXI.Container;
  
  /** Coin display */
  private coinDisplay!: PIXI.Text;
  
  /** Multiplier display */
  private multiplierDisplay!: PIXI.Text;
  
  /** Message display */
  private messageDisplay!: PIXI.Text;
  
  /** Win amount display */
  private winAmountDisplay!: PIXI.Text;
  
  /** Current game state */
  private gameState: IGameState | null = null;
  
  /** Message timeout ID */
  private messageTimeoutId: number | null = null;
  
  /**
   * Constructor
   * @param config Configuration for the UI
   */
  constructor(config: Partial<GameUIConfig> = {}) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize UI elements
    this.initUI();
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize UI elements
   */
  private initUI(): void {

    // Create background

    const background = new PIXI.Sprite(PIXI.Assets.get('background'));
    background.position.set(0, 0);
    background.width = this.config.width;
    background.height = this.config.height;
    this.addChild(background);

    const slotFrame = new PIXI.Sprite(PIXI.Assets.get('slots'));
    slotFrame.position.set(100, 130);
    slotFrame.width = this.config.width - 215;
    slotFrame.height = this.config.height - 260;
    this.addChild(slotFrame);

    // Create coin display
    this.coinDisplay = new PIXI.Text({
      text: 'Coins: 0',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.valueFontSize,
        fill: this.config.textColor
      }
    });
    this.coinDisplay.position.set(20, 20);
    this.addChild(this.coinDisplay);
    
    // Create multiplier display
    this.multiplierDisplay = new PIXI.Text({
      text: 'Multiplier: 1x',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.valueFontSize,
        fill: this.config.textColor
      }
    });    
    this.multiplierDisplay.position.set(20, 60);
    this.addChild(this.multiplierDisplay);
    
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
    this.spinButton = new SpinButton();
    this.spinButton.position.set(
      this.config.width / 2 - this.spinButton.width / 2,
      this.config.height - this.spinButton.height - 20
    );
    this.addChild(this.spinButton);
    
    // Create reset button
    this.resetButton = this.createResetButton();
    this.resetButton.position.set(
      this.config.width - 100, 
      20
    );
    this.addChild(this.resetButton);



    // Create symbols payout display
    const symbolsContainer = new PIXI.Container();
    symbolsContainer.position.set(10, 180);
    
    // Add title
    const title = new PIXI.Text({
      text: 'Values',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.labelFontSize,
        fill: this.config.textColor
      }
    } as PIXI.TextOptions);
    symbolsContainer.addChild(title);
    
    // Create grid of symbols
    SYMBOLS_ARRAY.forEach((symbol, index) => {
      const yPos = 30 + (index * 20);
            
      // Create value text
      const valueText = new PIXI.Text({
        text: `${symbol.emoji}  ${symbol.payoutValue}`,
        style: {
          fontFamily: this.config.fontFamily,
          fontSize: this.config.valueFontSize/2,
          fill: this.config.textColor
        }
      } as PIXI.TextOptions);
      valueText.position.set(1, yPos);
      symbolsContainer.addChild(valueText);
    });

    this.addChild(symbolsContainer);
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
    eventManager.subscribe(GameEventType.SPIN_BUTTON_CLICKED, () => {
      this.onSpinButtonClicked();
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
    this.spinButton.updateFromGameState(state.currentState);
  }
  
  /**
   * Handle spin button clicked event
   */
  private onSpinButtonClicked(): void {
    // Check if can spin
    if (!this.gameState || !this.gameState.canSpin) {
      return;
    }
    
    // Publish spin started event
    publishEvent(GameEventType.SPIN_STARTED, {
      currentCoins: this.gameState.playerStats.coins,
      spinCost: 1
    });
  }
  
  /**
   * Handle payout calculated event
   * @param amount Payout amount
   * @param multiplier Multiplier applied
   */
  private onPayoutCalculated(amount: number): void {


    if (amount > 0) {
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
    this.coinDisplay.text = `Coins: ${this.gameState.playerStats.coins}`;
    
    // Update multiplier display
    this.multiplierDisplay.text = `Multiplier: ${this.gameState.currentMultiplier}x`;
  }
  
  /**
   * Show a message
   * @param message Message to show
   * @param duration Duration to show the message (ms), 0 for indefinite
   */
  public showMessage(message: string, duration: number = 0): void {
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
  
  /**
   * Clear the message
   */
  public clearMessage(): void {
    this.messageDisplay.text = '';
    this.messageDisplay.visible = false;
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
    const animate = (ticker: PIXI.Ticker) => {
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
   * Create a reset button
   * @returns Reset button container
   */
  private createResetButton(): PIXI.Container {
    const container = new PIXI.Container();
    container.setSize(80, 30);
    // Create background
    const background = new PIXI.Graphics()
      .roundRect(0, 0, 80, 30, 5)
      .fill(0x0000ff);
    container.addChild(background);
    
    // Create text
    const text = new PIXI.Text({
      text: 'RESET',
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.labelFontSize,
        fill: 0xffffff,
      },
      align: 'center'
    } as PIXI.TextOptions);
    text.anchor.set(0.5);
    text.position.set(40, 15);
    container.addChild(text);
    
    // Set up interactivity
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    // Add event listeners
    container.on('pointerdown', () => {
      background.tint = 0x0000cc; // Darker blue when pressed
    });
    
    container.on('pointerup', () => {
      background.tint = 0x0000ff; // Back to normal blue
      this.onResetButtonClicked();
    });
    
    container.on('pointerupoutside', () => {
      background.tint = 0x0000ff; // Back to normal blue
    });
    
    container.on('pointerover', () => {
      background.tint = 0x3333ff; // Lighter blue when hovered
    });
    
    container.on('pointerout', () => {
      background.tint = 0x0000ff; // Back to normal blue
    });
    
    return container;
  }
  
  /**
   * Handle reset button clicked event
   */
  private onResetButtonClicked(): void {
    console.log("Reset button clicked");
    GameStateManager.resetState();
    this.showMessage('Game Restart!');
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
    this.spinButton.destroy();
    
    // Call parent destroy
    super.destroy({ children: true });
  }
}
