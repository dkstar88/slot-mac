import * as PIXI from "pixi.js";
import { Button, ButtonConfig } from "../components/Button";
import { MAIN_CONFIG } from "../config";

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

  buttons?: Partial<ButtonConfig>[];
  onClose?: (button_pressed?: string) => void;
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
  padding: 20,
};

/**
 * Message popup component for displaying messages with a close button
 */
export class MessagePopup extends PIXI.Container {
  /** Configuration for the popup */
  private config: MessagePopupConfig;

  /** Background overlay */
  private overlay!: PIXI.Graphics;

  /** Popup container */
  public popup!: PIXI.Container;

  /** Message text */
  private messageText!: PIXI.Text;

  /** Reference to the PIXI application */
  private app: PIXI.Application;

  private buttons: PIXI.Container[] = [];

  /**
   * Constructor
   * @param app PIXI application instance
   * @param config Configuration for the popup
   */
  constructor(app: PIXI.Application, config: Partial<MessagePopupConfig> = {}) {
    super();
    this.app = app;

    this.config = { ...DEFAULT_CONFIG, ...config };

    // Hide by default
    this.visible = false;
  }

  /**
   * Create a close button
   * @returns Close button container
   */
  private createButtons(): PIXI.Container {
    this.buttons = [];
    if (!this.config.buttons) {
      this.config.buttons = [
        {
          text: "Close",
          onClicked: () => this.close(),
        },
      ];
    }

    const button_container = new PIXI.Container();
    let btnX = 0;
    for (const btn of this.config.buttons) {
      const button = new Button({
        ...btn,
        onClicked: () => {
          if (btn.onClicked) btn.onClicked();
          this.close(btn.text);
        },
      });
      button.position.set(btnX, 0);
      button_container.addChild(button);
      btnX += button.width + 10;
      this.buttons.push(button);
    }
    button_container.position.set(
      (this.config.width - button_container.width) / 2,
      this.config.height - 50,
    );
    this.popup.addChild(button_container);

    return button_container;
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
  public show(message: string, config: Partial<MessagePopupConfig> = {}): void {
    this.config = { ...this.config, ...config };

    // Create overlay
    this.overlay = new PIXI.Graphics()
      .rect(0, 0, MAIN_CONFIG.width, MAIN_CONFIG.height)
      .fill({ color: 0x000000, alpha: 0.5 });
    this.addChild(this.overlay);

    // Create popup container
    this.popup = new PIXI.Container();
    this.popup.position.set(
      (MAIN_CONFIG.width - this.config.width) / 2,
      (MAIN_CONFIG.height - this.config.height) / 2,
    );
    this.addChild(this.popup);

    // Create popup background
    const background = new PIXI.Graphics()
      .roundRect(
        0,
        0,
        this.config.width,
        this.config.height,
        this.config.borderRadius,
      )
      .fill(this.config.backgroundColor)
      .stroke({
        color: this.config.borderColor,
        width: this.config.borderWidth,
        alpha: 1,
      });
    this.popup.addChild(background);

    // Create message text
    this.messageText = new PIXI.Text({
      text: message,
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
        align: "center",
        wordWrap: true,
        wordWrapWidth: this.config.width - this.config.padding * 2,
      },
    });
    this.messageText.anchor.set(0.5, 0.5);
    this.messageText.position.set(
      this.config.width / 2,
      this.config.height / 2 - 30, // Move text up to make room for button
    );
    this.popup.addChild(this.messageText);

    this.createButtons();

    // Set up interactivity for the overlay
    this.overlay.eventMode = "static";
    this.overlay.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      // Prevent clicks from passing through
      event.stopPropagation();
    });

    this.visible = true;

    // Add to stage if not already added
    if (!this.parent) {
      this.app.stage.addChild(this);
    }
  }

  /**
   * Close the popup
   */
  public close(button_pressed?: string): void {
    this.visible = false;

    // Call callback if exists
    if (this.config.onClose) {
      this.config.onClose(button_pressed);
    }

    this.removeFromParent();
    this.destroy();
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    // Remove event listeners
    this.buttons.forEach((btn) => {
      btn.removeAllListeners();
    });
    this.overlay.removeAllListeners();

    // Call parent destroy
    super.destroy({ children: true });
  }

  static Prompt(app: PIXI.Application, message: string, onClose?: () => void) {
    const popup = new MessagePopup(app, {
      buttons: [
        {
          text: "Close",
          onClicked: () => {
            // popup.close();
            if (onClose) onClose();
          },
        },
      ],
    });
    popup.show(message);
  }

  static Confirmation(
    app: PIXI.Application,
    message: string,
    onYes?: () => void,
    onNo?: () => void,
  ) {
    const popup = new MessagePopup(app, {
      buttons: [
        {
          text: "Yes",
          textColor: 0xffffff,
          color: 0x4caf50, // Green
          hoverColor: 0x66bb6a,
          downColor: 0x388e3c,
          onClicked: () => {
            if (onYes) onYes();
          },
        },
        {
          text: "No",
          textColor: 0xffffff,
          color: 0xf44336, // Red
          hoverColor: 0xef5350,
          downColor: 0xd32f2f,
          onClicked: () => {
            if (onNo) onNo();
          },
        },
      ],
    });
    popup.show(message);
  }
}
