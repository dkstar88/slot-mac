import * as PIXI from "pixi.js";

export interface CoinsConfig {
  width: number;
  height: number;
  color: number;
  textColor: number;
  fontFamily: string;
  fontSize: number;
}

const DEFAULT_CONFIG: CoinsConfig = {
  width: 250,
  height: 80,
  color: 0x333333,
  textColor: 0xffffff,
  fontFamily: "",
  fontSize: 16,
};

export class Coins extends PIXI.Container {
  private config: CoinsConfig;
  private coinDisplay!: PIXI.Text;
  private multiplierDisplay!: PIXI.Text;

  constructor(config: Partial<CoinsConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.init();
  }

  private init() {
    const background = new PIXI.Graphics()
      .roundRect(0, 0, this.config.width, this.config.height, 5)
      .fill({ color: this.config.color, alpha: 0.6 });
    this.addChild(background);

    // Create coin display
    const coinsLabel = new PIXI.Text({
      text: "Coins: ",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
      },
    });
    coinsLabel.position.set(20, 10);
    this.addChild(coinsLabel);

    // Create coin display
    this.coinDisplay = new PIXI.Text({
      text: "",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
      },
    });
    this.coinDisplay.position.set(100, 10);
    this.addChild(this.coinDisplay);

    // Create multiplier display
    const multiplierLabel = new PIXI.Text({
      text: "Multiplier: ",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
      },
    });
    multiplierLabel.position.set(20, 40);
    this.addChild(multiplierLabel);

    // Create multiplier display
    this.multiplierDisplay = new PIXI.Text({
      text: "",
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
      },
    });
    this.multiplierDisplay.position.set(multiplierLabel.width + 20, 40);
    this.addChild(this.multiplierDisplay);
  }

  public setCoins(value: number) {
    this.coinDisplay.text = value.toFixed();
  }

  public setMultiplier(value: number) {
    this.multiplierDisplay.text = value.toFixed();
  }
}
