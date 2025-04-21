import * as PIXI from 'pixi.js';
import { GameEventType } from '../types/events';
import { publishEvent } from '../utils/event-system';
import { GameStateType } from '../types/game-state';
import { sound } from '@pixi/sound';

/**
 * Configuration for the spin button
 */
export interface SpinButtonConfig {
  /** Width of the button */
  width: number;
  
  /** Height of the button */
  height: number;
  
  /** Corner radius of the button */
  cornerRadius: number;
  
  /** Background color of the button */
  backgroundColor: number;
  
  /** Background color when disabled */
  disabledColor: number;
  
  /** Background color when hovered */
  hoverColor: number;
  
  /** Background color when pressed */
  pressedColor: number;
  
  /** Text to display on the button */
  text: string;
  bet: number;
  /** Text style */
  textStyle: PIXI.TextStyle;
}

/**
 * Default configuration for the spin button
 */
const DEFAULT_CONFIG: SpinButtonConfig = {
  width: 120,
  height: 50,
  cornerRadius: 10,
  backgroundColor: 0xff0000,
  disabledColor: 0x888888,
  hoverColor: 0xff3333,
  pressedColor: 0xcc0000,
  text: 'SPIN',
  bet: 1,
  textStyle: new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
    align: 'center'
  })
};

/**
 * Spin button component for the slot machine
 */
export class SpinButton extends PIXI.Container {
  /** Configuration for the button */
  private config: SpinButtonConfig;
  
  /** Background graphics */
  private background: PIXI.Graphics;
  
  /** Text display */
  private textDisplay: PIXI.Text;
  
  /** Current state of the button */
  private state: 'normal' | 'hover' | 'pressed' | 'disabled' | 'spinning' = 'normal';
  
  /** Whether the button is currently spinning */
  private isSpinning: boolean = false;
  
  /**
   * Constructor
   * @param config Configuration for the button
   */
  constructor(config: Partial<SpinButtonConfig> = {}) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Create background
    this.background = new PIXI.Graphics();
    this.drawBackground();
    this.addChild(this.background);
    
    // Create text
    this.textDisplay = new PIXI.Text(this.config.text, this.config.textStyle);
    this.textDisplay.anchor.set(0.5);
    this.textDisplay.position.set(this.config.width / 2, this.config.height / 2);
    this.addChild(this.textDisplay);
    
    // Set up interactivity
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    // Add event listeners
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUpOutside.bind(this));
    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
  }
  
  /**
   * Draw the button background
   */
  private drawBackground(): void {
    this.background.clear();
    
    // Set fill color based on state
    let fillColor: number;
    switch (this.state) {
      case 'hover':
        fillColor = this.config.hoverColor;
        break;
      case 'pressed':
        fillColor = this.config.pressedColor;
        break;
      case 'disabled':
      case 'spinning':
        fillColor = this.config.disabledColor;
        break;
      default:
        fillColor = this.config.backgroundColor;
    }
    
    // Draw rounded rectangle
    this.background
      .roundRect(0, 0, this.config.width, this.config.height, this.config.cornerRadius)
      .fill(fillColor);
  }
  
  /**
   * Handle pointer down event
   */
  private onPointerDown(): void {
    console.log("SpinButton: onPointerDown");
    if (this.state === 'disabled' || this.state === 'spinning') {
      console.log("SpinButton: onPointerDown - button is disabled or spinning");
      return;
    }
    
    this.state = 'pressed';
    this.drawBackground();
  }
  
  /**
   * Handle pointer up event
   */
  private onPointerUp(): void {
    console.log("SpinButton: onPointerUp");
    if (this.state === 'disabled' || this.state === 'spinning') {
      console.log("SpinButton: onPointerUp - button is disabled or spinning");
      return;
    }
    
    // If the button was pressed, trigger a click
    if (this.state === 'pressed') {
      console.log("SpinButton: onPointerUp - triggering click");
      this.onClick();
    }
    
    this.state = 'hover';
    this.drawBackground();
  }
  
  /**
   * Handle pointer up outside event
   */
  private onPointerUpOutside(): void {
    if (this.state === 'disabled' || this.state === 'spinning') return;
    
    this.state = 'normal';
    this.drawBackground();
  }
  
  /**
   * Handle pointer over event
   */
  private onPointerOver(): void {
    if (this.state === 'disabled' || this.state === 'spinning') return;
    
    this.state = 'hover';
    this.drawBackground();
  }
  
  /**
   * Handle pointer out event
   */
  private onPointerOut(): void {
    if (this.state === 'disabled' || this.state === 'spinning') return;
    
    this.state = 'normal';
    this.drawBackground();
  }
  
  /**
   * Handle click event
   */
  private onClick(): void {
    console.log("SpinButton clicked");
    
    this.disable();
    sound.play("insert", () => {
      // Publish spin button clicked event
      
      publishEvent(GameEventType.SPIN_BUTTON_CLICKED, {
        bet: this.config.bet
      });
      
      // Start spinning animation
      this.startSpinning();      
      this.enable();
    });    
  }
  
  /**
   * Start spinning animation
   */
  public startSpinning(): void {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.state = 'spinning';
    this.drawBackground();
    
    // Disable interactivity
    this.eventMode = 'none';
    this.cursor = 'default';
  }
  
  /**
   * Stop spinning animation
   */
  public stopSpinning(): void {
    if (!this.isSpinning) return;
    
    this.isSpinning = false;
    this.state = 'normal';
    this.drawBackground();
    
    // Enable interactivity
    this.eventMode = 'static';
    this.cursor = 'pointer';
  }
  
  /**
   * Enable the button
   */
  public enable(): void {
    if (this.isSpinning) return;
    
    this.state = 'normal';
    this.drawBackground();
    
    // Enable interactivity
    this.eventMode = 'static';
    this.cursor = 'pointer';
  }
  
  /**
   * Disable the button
   */
  public disable(): void {
    this.state = 'disabled';
    this.drawBackground();
    
    // Disable interactivity
    this.eventMode = 'none';
    this.cursor = 'default';
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Call parent destroy
    super.destroy({ children: true });
  }
  
  /**
   * Update the button state based on game state
   * @param gameState Current game state
   */
  public updateFromGameState(gameState: GameStateType): void {
    switch (gameState) {
      case GameStateType.SPINNING:
        this.startSpinning();
        break;
      case GameStateType.IDLE:
        this.stopSpinning();
        this.enable();
        break;
      case GameStateType.EVALUATING:
      case GameStateType.CELEBRATING:
        this.disable();
        break;
    }
  }
}
