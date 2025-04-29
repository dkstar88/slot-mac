import { Button, ButtonConfig } from './Button';
import { GameEventType } from '../types/events';
import { publishEvent } from '../utils/event-system';
import { sound } from '@pixi/sound';
import { GameStateManager } from '../state/game-state-manager';

/**
 * Configuration for the spin button
 */
export interface SpinButtonConfig extends ButtonConfig {
  /** Bet amount for this spin button */
  bet: number;
}

/**
 * Default configuration for the spin button
 */
const DEFAULT_SPIN_CONFIG: Partial<SpinButtonConfig> = {
  width: 120,
  height: 50,
  rounded: 10,
  color: 0xff0000,
  disabledColor: 0x888888,
  hoverColor: 0xff3333,
  downColor: 0xcc0000,
  text: 'SPIN',
  bet: 1,
  fontSize: 24,
  fontFamily: 'Arial',
  textColor: 0xffffff,
  highlightStrength: 0.3,
  shadowStrength: 0.3,
  shadowDistance: 3
};

/**
 * Spin button component for the slot machine
 */
export class SpinButton extends Button {
  /** Whether the button is currently spinning */
  private isSpinning: boolean = false;
  
  /**
   * Constructor
   * @param config Configuration for the button
   */
  constructor(config: Partial<SpinButtonConfig> = {}) {
    // Merge default spin config with base button defaults and user config
    super({ ...DEFAULT_SPIN_CONFIG, ...config, onClicked: () => this.onClick() });
  }
  
  /**
   * Handle click event
   */
  private onClick(): void {
    console.log("SpinButton clicked", this.config);
    
    if (!GameStateManager.canBet((this.config as SpinButtonConfig).bet)) {
      return;
    }

    // this.disable();
    
    sound.play("insert", () => {
      // Publish spin button clicked event
      publishEvent(GameEventType.SPIN_BUTTON_CLICKED, {
        bet: (this.config as SpinButtonConfig).bet
      });
      
      // Start spinning animation
      this.startSpinning();      
      // this.enable();
    });
    
  }

  /**
   * Start spinning animation
   */
  public startSpinning(): void {
    if (this.isSpinning) return;

    this.isSpinning = true;
    // this.disable(); // Use the Button's disable method
  }
  
  /**
   * Stop spinning animation
   */
  public stopSpinning(): void {
    if (!this.isSpinning) return;
    
    this.isSpinning = false;
    // this.enable(); // Use the Button's enable method
  }
  
}
