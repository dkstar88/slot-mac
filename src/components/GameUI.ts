import * as PIXI from 'pixi.js';
import { AnimatedSprite } from 'pixi.js';
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
  // private spinButton!: SpinButton;
  private spinButtons: SpinButton[] = [];
  
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
  
  /** Container for coin particles */
  private particleContainer!: PIXI.Container;
  
  /** Gold coin spritesheet */
  private goldCoinSpritesheet: PIXI.Spritesheet | null = null;
  
  /**
   * Constructor
   * @param config Configuration for the UI
   */
  constructor(config: Partial<GameUIConfig> = {}) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize UI elements
    this.initUI();
    
    // Initialize particle system
    this.initParticleSystem();
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize UI elements
   */
  private initUI(): void {


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
    this.coinDisplay.text = `Coins: ${this.gameState.playerStats.coins}`;
    
    // Update multiplier display
    this.multiplierDisplay.text = `Bet: ${this.gameState.currentMultiplier} coins`;
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
      const animate = (ticker: PIXI.Ticker) => {
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
    
    // Call parent destroy
    super.destroy({ children: true });
  }
}
