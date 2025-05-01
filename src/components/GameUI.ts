import * as PIXI from "pixi.js";
import { SpinButton } from "./SpinButton";
import { sound } from "@pixi/sound";
import {
  GameEventType,
  GameStateChangedEvent,
  PayoutCalculatedEvent,
  SpinButtonClickedEvent,
} from "../types/events";
import { eventManager, publishEvent } from "../utils/event-system";
import { IGameState } from "../types/game-state";
import { GameStateManager } from "../state/game-state-manager";
import { MAIN_CONFIG } from "../config";
import { MessagePopup } from "./MessagePopup";
import { Coins } from "./Coins";
import { GlyphValuesBoard } from "./GlyphValuesBoard";
import { CombinationBoard } from "./CombinationBoard";
import { Button } from "./Button";
import * as gold from "../animations/gold";
import logger from "../utils/logger";
import { Scene } from "../scenes/Scene";

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
export class GameUI extends PIXI.Container implements Scene {
  /** Configuration for the UI */
  private config: GameUIConfig;

  /** Spin button */
  // private spinButton!: SpinButton;
  private spinButtons: SpinButton[] = [];

  /** Reset button */
  private resetButton!: PIXI.Container;

  /** Show popup button */
  private showPopupButton!: PIXI.Container;

  /** Menu button */
  private menuButton!: PIXI.Container;

  /** Coin display */
  private coinDisplay!: Coins;

  /** Message display */
  private messageDisplayContainer!: PIXI.Container;
  private messageDisplay!: PIXI.Text;

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
  private glyphListContainer!: PIXI.Container;

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

    // Subscribe to events
    this.subscribeToEvents();
  }

  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.combinationsContainer.position.set(this.config.width - 220, 180);
    this.resetButton.position.set(this.config.width - 100, 20);
    this.winAmountDisplay.position.set(this.config.width / 2, 150);
    this.messageDisplay.position.set(
      this.config.width / 2,
      this.messageDisplayContainer.height / 2,
    );
    const spinButtonsWidth = (120 + 10) * 5;
    let spinButtonX = this.config.width / 2 - spinButtonsWidth / 2;
    for (const betBtn of this.spinButtons) {
      betBtn.position.set(spinButtonX, this.config.height - 50 - 20);
      spinButtonX += betBtn.width + 10;
    }
    this.showPopupButton.position.set(this.config.width - 200, 20);
    this.menuButton.position.set(this.config.width - 300, 20);
    this.glyphListContainer.position.set(30, 180);
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

    this.messageDisplayContainer = new PIXI.Container();
    const frame = new PIXI.Graphics()
      .roundRect(0, 0, MAIN_CONFIG.board.width, 100)
      .fill({
        color: 0x000000,
        alpha: 0.2,
      });
    this.messageDisplayContainer.addChild(frame);

    // Create message display
    this.messageDisplay = new PIXI.Text({
      text: "",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.valueFontSize,
        fill: this.config.textColor,
        align: "center",
      },
    });
    this.messageDisplayContainer.addChild(this.messageDisplay);
    this.messageDisplay.anchor.set(0.5, 0.5);
    this.messageDisplay.position.set(
      this.config.width / 2,
      this.messageDisplayContainer.height / 2,
    );
    this.messageDisplayContainer.position.set(
      this.config.width / 2,
      this.config.height - 150,
    );
    this.addChild(this.messageDisplayContainer);

    // Create win amount display
    this.winAmountDisplay = new PIXI.Text({
      text: "",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.valueFontSize,
        fill: this.config.textColor,
        align: "center",
      },
    });
    this.winAmountDisplay.anchor.set(0.5, 0);
    this.winAmountDisplay.position.set(this.config.width / 2, 150);
    this.winAmountDisplay.visible = false;
    this.addChild(this.winAmountDisplay);

    // Create spin button
    const spinButtonsWidth = (120 + 10) * 5;
    let spinButtonX = this.config.width / 2 - spinButtonsWidth / 2;
    [1, 2, 3, 5, 10].forEach((bet) => {
      const betBtn = new SpinButton({
        text: "Bet " + bet.toString(),
        bet: bet,
      });
      betBtn.position.set(spinButtonX, this.config.height - 50 - 20);
      this.addChild(betBtn);
      this.spinButtons.push(betBtn);
      spinButtonX += betBtn.width + 10;
    });

    // Create reset button
    this.resetButton = this.createResetButton();
    this.resetButton.position.set(this.config.width - 100, 20);
    this.addChild(this.resetButton);

    // Create show popup button
    this.showPopupButton = this.createShowPopupButton();
    this.showPopupButton.position.set(this.config.width - 200, 20);
    this.addChild(this.showPopupButton);

    // Create menu button
    this.menuButton = this.createMenuButton();
    this.menuButton.position.set(this.config.width - 300, 20);
    this.addChild(this.menuButton);

    this.glyphListContainer = new GlyphValuesBoard({
      width: 180,
      height: 300,
      color: 0x333333,
      fontFamily: this.config.fontFamily,
      fontSize: this.config.valueFontSize,
      textColor: this.config.textColor,
    });
    this.glyphListContainer.position.set(30, 180);
    this.addChild(this.glyphListContainer);
  }

  /**
   * Subscribe to events
   */
  private subscribeToEvents(): void {
    // Subscribe to game state changed event
    eventManager.subscribe(
      GameEventType.GAME_STATE_CHANGED,
      (event: GameStateChangedEvent) => {
        this.onGameStateChanged(event.state);
      },
    );

    // Subscribe to spin button clicked event
    eventManager.subscribe(
      GameEventType.SPIN_BUTTON_CLICKED,
      (event: SpinButtonClickedEvent) => {
        this.onSpinButtonClicked(event.bet);
      },
    );

    // Subscribe to spin started event
    eventManager.subscribe(GameEventType.SPIN_STARTED, () => {
      this.hideWinAmount();
    });

    // Subscribe to payout calculated event
    eventManager.subscribe(
      GameEventType.PAYOUT_CALCULATED,
      (event: PayoutCalculatedEvent) => {
        this.onPayoutCalculated(event.amount);
      },
    );

    // Subscribe to celebration started event
    eventManager.subscribe(GameEventType.CELEBRATION_STARTED, () => {
      this.showMessage("Winner!");
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
    logger.debug("GameUI: onGameStateChanged called", state);
    this.gameState = state;

    // Update UI elements
    this.updateUI();

    // Update spin button state
    // this.spinButtons.forEach((spinButton) => {
    //   spinButton.updateFromGameState(state.currentState);
    // });
  }

  /**
   * Handle spin button clicked event
   */
  private onSpinButtonClicked(bet: number): void {
    // Check if can spin
    logger.debug("Current game state:", this.gameState);
    if (!this.gameState || !this.gameState.canSpin) {
      return;
    }

    // Publish spin started event
    publishEvent(GameEventType.SPIN_STARTED, {
      currentCoins: this.gameState.playerStats.coins,
      spinCost: bet,
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
      let soundSec = 1;
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
      this.showMessage("Try again!");
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
   * Show a message
   * @param message Message to show
   * @param duration Duration to show the message (ms), 0 for indefinite
   * @param usePopup Whether to use the popup dialog (true) or simple text display (false)
   */
  public showMessage(
    message: string,
    duration: number = 0,
    usePopup: boolean = false,
  ): void {
    if (usePopup) {
      MessagePopup.Prompt(this.app, message);
    } else {
      // Show message in simple text display (original behavior)
      // Clear any existing timeout
      if (this.messageTimeoutId !== null) {
        clearTimeout(this.messageTimeoutId);
        this.messageTimeoutId = null;
      }

      // Set message text
      this.messageDisplay.text = message;
      this.messageDisplay.position.set(
        this.messageDisplayContainer.width / 2,
        this.messageDisplayContainer.height / 2,
      );
      this.messageDisplayContainer.position.set(
        (this.config.width - this.messageDisplayContainer.width) / 2,
        this.config.height - 200,
      );
      this.messageDisplayContainer.visible = true;

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
    this.messageDisplay.text = "";
    this.messageDisplayContainer.visible = false;
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
    const button = new Button({
      width: 80,
      height: 30,
      text: "POPUP",
      fontFamily: this.config.fontFamily,
      fontSize: this.config.labelFontSize,
      textColor: 0xffffff,
      color: 0x00aa00,
      hoverColor: 0x00cc00,
      downColor: 0x008800,
      onClicked: () => this.onShowPopupButtonClicked(),
    });
    return button;
  }

  /**
   * Handle show popup button clicked event
   */
  private onShowPopupButtonClicked(): void {
    this.showPopupMessage("Welcome to Fruit Fortune.");
  }

  /**
   * Create a reset button
   * @returns Reset button container
   */
  private createResetButton(): PIXI.Container {
    const button = new Button({
      width: 80,
      height: 30,
      text: "RESET",
      fontFamily: this.config.fontFamily,
      fontSize: this.config.labelFontSize,
      textColor: 0xffffff,
      onClicked: () => this.onResetButtonClicked(),
    });
    return button;
  }

  /**
   * Create a menu button
   * @returns Menu button container
   */
  private createMenuButton(): PIXI.Container {
    const button = new Button({
      width: 80,
      height: 30,
      text: "MENU",
      fontFamily: this.config.fontFamily,
      fontSize: this.config.labelFontSize,
      textColor: 0xffffff,
      color: 0x4caf50, // Green
      hoverColor: 0x66bb6a,
      downColor: 0x388e3c,
      onClicked: () => this.onMenuButtonClicked(),
    });
    return button;
  }

  /**
   * Handle menu button clicked event
   */
  private onMenuButtonClicked(): void {
    // Show confirmation popup
    MessagePopup.Confirmation(this.app, "Return to main menu?", () => {
      GameStateManager.returnToMenu();
    });
  }

  /**
   * Handle reset button clicked event
   */
  private onResetButtonClicked(): void {
    GameStateManager.resetState();
    this.showMessage("Game Restart!", 1000);
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
      fontSize: this.config.valueFontSize * 0.8,
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
  }

  /**
   * Emit gold coins based on payout amount
   * @param amount Number of coins to emit
   */
  private emitGoldCoins(amount: number): void {
    gold.emitGoldCoins(
      this.config.width / 2,
      this.config.height / 2,
      this.config.width,
      this.config.height,
      amount,
      this.particleContainer,
    );
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

    // Call parent destroy
    super.destroy({ children: true });
  }
}
