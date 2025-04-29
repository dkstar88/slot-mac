import * as PIXI from 'pixi.js';
import { Button } from '../components/Button';
import { MAIN_CONFIG } from '../config';

/**
 * Configuration for the message popup
 */
export interface MessagePopupConfig {
  /** Width of the popup */
  width: number;
  
  /** Height of the popup */
  height: number;
  
  /** Background color */
  backgroundColor: number;
  
  /** Text color */
  textColor: number;
  
  /** Font family */
  fontFamily: string;
  
  /** Font size for the message */
  fontSize: number;
  
  /** Border radius */
  borderRadius: number;
  
  /** Border color */
  borderColor: number;
  
  /** Border width */
  borderWidth: number;
  
  /** Padding */
  padding: number;
}

/**
 * Default configuration for the message popup
 */
const DEFAULT_CONFIG: MessagePopupConfig = {
  width: 400,
  height: 200,
  backgroundColor: 0x000000,
  textColor: 0xffffff,
  fontFamily: '"Gill Sans", sans-serif',
  fontSize: MAIN_CONFIG.messageFontSize,
  borderRadius: 10,
  borderColor: 0xffffff,
  borderWidth: 2,
  padding: 20
};

/**
 * Message popup component for displaying messages with a close button
 */
export class MessagePopup extends PIXI.Container {
  /** Configuration for the popup */
  private config: MessagePopupConfig;
  
  /** Background overlay */
  private overlay: PIXI.Graphics;
  
  /** Popup container */
  public popup: PIXI.Container;
  
  /** Message text */
  private messageText: PIXI.Text;
  
  /** Close button */
  private closeButton: PIXI.Container;
  
  /** Callback for when the popup is closed */
  private onCloseCallback: (() => void) | null = null;
  
  /** Reference to the PIXI application */
  private app: PIXI.Application;
  
  /**
   * Constructor
   * @param app PIXI application instance
   * @param config Configuration for the popup
   */
  constructor(app: PIXI.Application, config: Partial<MessagePopupConfig> = {}) {
    super();
    this.app = app;
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    


    // Create overlay
    this.overlay = new PIXI.Graphics()
      .rect(0, 0, MAIN_CONFIG.width, MAIN_CONFIG.height)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.addChild(this.overlay);
        
    // Create popup container
    this.popup = new PIXI.Container();
    this.popup.position.set(
      (MAIN_CONFIG.width - this.config.width) / 2,
      (MAIN_CONFIG.height - this.config.height) / 2
    );
    this.addChild(this.popup);
    
    // Create popup background
    const background = new PIXI.Graphics()
      .roundRect(
        0, 
        0, 
        this.config.width, 
        this.config.height, 
        this.config.borderRadius
      )
      .fill(this.config.backgroundColor)
      .stroke({
        color: this.config.borderColor,
        width: this.config.borderWidth,
        alpha: 1
      });
    this.popup.addChild(background);
    
    // Create message text
    this.messageText = new PIXI.Text('', {
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      fill: this.config.textColor,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: this.config.width - (this.config.padding * 2)
    });
    this.messageText.anchor.set(0.5, 0.5);
    this.messageText.position.set(
      this.config.width / 2,
      this.config.height / 2 - 30 // Move text up to make room for button
    );
    this.popup.addChild(this.messageText);
    
    // Create close button
    this.closeButton = this.createCloseButton();
    // Position the button below the text and centered
    this.closeButton.position.set(
      (this.config.width - this.closeButton.width)/2,
      this.messageText.y + this.closeButton.height + 50 // Position below the text
    );
    this.popup.addChild(this.closeButton);
    
    // Set up interactivity for the overlay
    this.overlay.eventMode = 'static';
    this.overlay.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      // Prevent clicks from passing through
      event.stopPropagation();
    });
    
    // Hide by default
    this.visible = false;
  }
  
  /**
   * Create a close button
   * @returns Close button container
   */
  private createCloseButton(): PIXI.Container {
    
    const button = new Button({
      text: 'Close',
      onClicked: () => this.close(),
    })
    
    button.position.set(200, 100);

    
    return button;
  }
  
  /**
   * Get the width of the popup
   */
  public get width(): number {
    return this.config.width;
  }
  
  /**
   * Get the height of the popup
   */
  public get height(): number {
    return this.config.height;
  }
  
  /**
   * Show the popup with a message
   * @param message Message to display
   * @param onClose Callback for when the popup is closed
   */
  public show(message: string, onClose?: () => void): void {
    this.messageText.text = message;
    this.visible = true;
    
    // Store callback
    this.onCloseCallback = onClose || null;
    
    // Add to stage if not already added
    if (!this.parent) {
      this.app.stage.addChild(this);
    }
  }
  
  /**
   * Add a child to the popup container
   * @param child Child to add
   * @returns The added child
   */
  public addToPopup<T extends PIXI.Container>(child: T): T {
    return this.popup.addChild(child);
  }
  
  /**
   * Close the popup
   */
  public close(): void {
    this.visible = false;
    
    // Call callback if exists
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Remove event listeners
    this.closeButton.removeAllListeners();
    this.overlay.removeAllListeners();
    
    // Call parent destroy
    super.destroy({ children: true });
  }
}
