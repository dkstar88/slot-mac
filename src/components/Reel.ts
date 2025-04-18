import * as PIXI from 'pixi.js';
import { BlurFilter } from 'pixi.js';
import { Symbol, SymbolInstance } from '../types/symbols';
import { getRandomSymbol, createSymbolInstance } from '../core/symbols';
import { GameEventType } from '../types/events';
import { publishEvent } from '../utils/event-system';

/**
 * Configuration for the reel
 */
export interface ReelConfig {
  /** Width of the reel */
  width: number;
  
  /** Height of the reel */
  height: number;
  
  /** Number of visible symbols */
  visibleSymbols: number;
  
  /** Size of each symbol */
  symbolSize: number;
  
  /** Spacing between symbols */
  symbolSpacing: number;
  
  /** Duration of the spin animation in milliseconds */
  spinDuration: number;
  
  /** Delay before the reel starts spinning */
  spinStartDelay: number;
  
  /** Delay before the reel stops spinning */
  spinStopDelay: number;
  
  /** Easing function for the spin animation */
  spinEasing: (t: number) => number;
}

/**
 * Default configuration for the reel
 */
const DEFAULT_CONFIG: ReelConfig = {
  width: 100,
  height: 300,
  visibleSymbols: 3,
  symbolSize: 100,
  symbolSpacing: 0,
  spinDuration: 3000,
  spinStartDelay: 50,
  spinStopDelay: 0,
  spinEasing: (t: number) => {
    // Ease out cubic
    return 1 - Math.pow(1 - t, 3);
  }
};

/**
 * Reel component for the slot machine
 */
export class Reel extends PIXI.Container {
  /** Configuration for the reel */
  private config: ReelConfig;
  
  /** Container for the symbols */
  private symbolsContainer: PIXI.Container;
  
  /** Mask for the symbols container */
  public symbolsMask: PIXI.Graphics;
  
  /** Array of symbol instances */
  private symbols: SymbolInstance[] = [];
  
  /** Whether the reel is currently spinning */
  private isSpinning: boolean = false;
  
  /** Current position of the reel (for animation) */
  private reelPosition: number = 0;
  
  /** Previous position of the reel (for blur calculation) */
  private previousReelPosition: number = 0;
  
  /** Blur filter for motion effect */
  private blurFilter: BlurFilter;
  
  /** Index of this reel */
  private reelIndex: number;
  
  /** Extra symbols to add above and below the visible area */
  private extraSymbols: number = 5;
  
  /** Tweening objects for animation */
  private tweening: any[] = [];
  
  /**
   * Constructor
   * @param reelIndex Index of this reel
   * @param config Configuration for the reel
   */
  constructor(reelIndex: number, config: Partial<ReelConfig> = {}) {
    super();
    
    this.reelIndex = reelIndex;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Create container for symbols
    this.symbolsContainer = new PIXI.Container();
    this.addChild(this.symbolsContainer);
    
    // Create mask
    this.symbolsMask = new PIXI.Graphics();
    this.symbolsMask.rect(0, 0, this.config.width, this.config.height).fill(0xffffff);
    this.addChild(this.symbolsMask);
    
    // Apply mask to symbols container
    this.symbolsContainer.mask = this.symbolsMask;
    
    // Create blur filter
    this.blurFilter = new BlurFilter();
    this.blurFilter.blurX = 0;
    this.blurFilter.blurY = 0;
    this.symbolsContainer.filters = [this.blurFilter];
    
    // Initialize symbols
    this.initSymbols();
    
    // Set up ticker for animation updates
    PIXI.Ticker.shared.add(this.update, this);
  }
  
  /**
   * Initialize symbols
   */
  private initSymbols(): void {
    // Clear existing symbols
    this.symbolsContainer.removeChildren();
    this.symbols = [];
    
    // Calculate total number of symbols (visible + extra)
    const totalSymbols = this.config.visibleSymbols + this.extraSymbols * 2;
    
    // Create symbols
    for (let i = 0; i < totalSymbols; i++) {
      // Create symbol instance
      const symbol = getRandomSymbol();
      const symbolInstance = createSymbolInstance(symbol, i, this.reelIndex);
      
      // Create symbol container
      const symbolContainer = this.createSymbolContainer(symbolInstance);
      
      // Position symbol
      symbolContainer.position.y = i * (this.config.symbolSize + this.config.symbolSpacing);
      
      // Add to container
      this.symbolsContainer.addChild(symbolContainer);
      
      // Add to symbols array
      this.symbols.push(symbolInstance);
    }
    
    // Position symbols container to show only visible symbols
    this.symbolsContainer.position.y = -this.extraSymbols * (this.config.symbolSize + this.config.symbolSpacing);
  }
  
  /**
   * Create a container for a symbol
   * @param symbolInstance Symbol instance
   * @returns Container for the symbol
   */
  private createSymbolContainer(symbolInstance: SymbolInstance): PIXI.Container {
    // Create container
    const container = new PIXI.Container();
    // container.label = `symbol-${symbolInstance.symbol.type}`;
    
    // Create background
    const background = new PIXI.Graphics();
    background.rect(0, 0, this.config.symbolSize, this.config.symbolSize).fill(0xffffff);
    container.addChild(background);
    
    // Create symbol
    const text = new PIXI.Text({
      text: symbolInstance.symbol.emoji,
      style:{
        fontFamily: 'Arial',
        fontSize: this.config.symbolSize * 0.7,
        fill: 0x000000,
        align: 'center'  
      }
    });
    text.anchor.set(0, 0);
    container.addChild(text);
        
    
    return container;
  }

  
  /**
   * Start spinning the reel
   */
  public spin(): void {
    
    // Reset symbols
    this.resetSymbols();

    if (this.isSpinning) {
      return;
    }
    
    // Set spinning flag
    this.isSpinning = true;
    
    // Calculate extra random amount for variety
    const extra = Math.floor(Math.random() * 3);
    
    // Calculate target position
    // The target is current position plus a base amount, plus some extra based on reel index and random factor
    const target = this.reelPosition + 10 + this.reelIndex * 5 + extra;
    
    // Calculate spin duration with some variety
    const time = 1500 + this.reelIndex * 600 + extra * 600;
       
    // Start the tween animation
    this.tweenTo(
      'reelPosition',
      target,
      time,
      this.backout(0.2),
      undefined,
      this.onSpinComplete.bind(this)
    );
  }
  
  /**
   * Stop spinning the reel
   * @param targetSymbols Symbols to show when the reel stops
   */
  public stopSpin(targetSymbols?: Symbol[]): void {

    if (!this.isSpinning) return;
    
    // // If target symbols are provided, update the symbols
    if (targetSymbols && targetSymbols.length === this.config.visibleSymbols) {
      // Calculate the position where the reel should stop
      // const symbolHeight = this.config.symbolSize + this.config.symbolSpacing;
      
      // Update the symbols that will be visible when the reel stops
      for (let i = 0; i < this.config.visibleSymbols; i++) {
        const symbolIndex = this.extraSymbols + i;
        const symbol = targetSymbols[i];
        
        // Update the symbol instance
        this.symbols[symbolIndex] = createSymbolInstance(symbol, i, this.reelIndex);
        
        // Update the symbol container
        const symbolContainer = this.symbolsContainer.children[symbolIndex] as PIXI.Container;
        symbolContainer.removeChildren();
        
        // Create new symbol container
        const newSymbolContainer = this.createSymbolContainer(this.symbols[symbolIndex]);
        
        // Copy position
        newSymbolContainer.position.y = symbolContainer.position.y;
        
        // Replace old container with new one
        this.symbolsContainer.removeChildAt(symbolIndex);
        this.symbolsContainer.addChildAt(newSymbolContainer, symbolIndex);
      }
    }
    
    // For immediate stop, we can cancel current tweens and create a new one with shorter duration
    this.tweening = [];
    
    // Calculate the nearest stopping point (complete symbol)
    const symbolHeight = this.config.symbolSize + this.config.symbolSpacing;
    const targetPosition = Math.ceil(this.reelPosition / symbolHeight) * symbolHeight;
    
    // Create a short tween to stop at the next symbol boundary
    this.tweenTo(
      'reelPosition',
      targetPosition,
      500 + this.config.spinStopDelay,
      this.backout(0.8),
      undefined,
      this.onSpinComplete.bind(this)
    );
  }
  
  /**
   * Called when spin animation completes
   */
  private onSpinComplete(): void {
    // Animation complete
    this.isSpinning = false;
    
    // Publish reel stopped event
    publishEvent(GameEventType.REEL_STOPPED, {
      reelIndex: this.reelIndex,
      symbols: this.getVisibleSymbols()
    });
  }
  
  // Counter for update logging
  private static updateCount: number = 0;
  
  /**
   * Update method called on each tick
   * @param ticker The ticker instance
   */
  private update(ticker: PIXI.Ticker): void {
    // Log first few updates to confirm ticker is working
    if (Reel.updateCount < 5) {
      Reel.updateCount++;
    }
       
    // Update blur filter based on speed
    this.blurFilter.blurY = (this.reelPosition - this.previousReelPosition) * 8;
    this.previousReelPosition = this.reelPosition;
    
    // Update symbol positions on reel
    const symbolHeight = this.config.symbolSize + this.config.symbolSpacing;
    
    for (let i = 0; i < this.symbols.length; i++) {
      const symbolContainer = this.symbolsContainer.children[i] as PIXI.Container;
      const prevY = symbolContainer.position.y;
      
      // Calculate new position based on reel position
      symbolContainer.position.y = ((this.reelPosition + i) % this.symbols.length) * symbolHeight - symbolHeight;
      // (symbolContainer.getChildAt(2) as PIXI.Text).text = `${i}) ${symbolContainer.position.y} ${this.symbols[i].row}, ${this.symbols[i].column}`;
      // Detect if symbol went over the top and needs to be updated
      if (symbolContainer.position.y < 0 && prevY > symbolHeight) {
        // Get a new random symbol
        const symbol = getRandomSymbol();
        
        // Update the symbol instance
        this.symbols[i] = createSymbolInstance(symbol, this.symbols[i].row, this.reelIndex);
        
        // Update the symbol container
        symbolContainer.removeChildren();
        
        // Create new symbol container
        const newSymbolContainer = this.createSymbolContainer(this.symbols[i]);
        
        // Copy position
        newSymbolContainer.position.y = symbolContainer.position.y;
        
        // Replace old container with new one
        this.symbolsContainer.removeChildAt(i);
        this.symbolsContainer.addChildAt(newSymbolContainer, i);

      }
    }
    
    // Update tweening animations
    this.updateTweens();
  }
  
  /**
   * Reset the symbols after spinning
   */
  private resetSymbols(): void {
    // Store the visible symbols before resetting
    const visibleSymbols = this.getVisibleSymbols().map(s => s.symbol);
    
    // Reset the position
    const symbolHeight = this.config.symbolSize + this.config.symbolSpacing;
    this.symbolsContainer.position.y = -this.extraSymbols * symbolHeight;
    
    // Reset position tracking
    this.reelPosition = 0;
    this.previousReelPosition = 0;
    
    // Reset blur
    this.blurFilter.blurY = 0;
    
    // Clear existing symbols
    this.symbolsContainer.removeChildren();
    this.symbols = [];
    
    // Calculate total number of symbols (visible + extra)
    const totalSymbols = this.config.visibleSymbols + this.extraSymbols * 2;
    
    // Create symbols
    for (let i = 0; i < totalSymbols; i++) {
      // Determine which symbol to use
      let symbol;
      if (i >= this.extraSymbols && i < this.extraSymbols + this.config.visibleSymbols) {
        // For visible positions, use the stored visible symbols
        const visibleIndex = i - this.extraSymbols;
        symbol = visibleSymbols[visibleIndex];
      } else {
        // For non-visible positions, use random symbols
        symbol = getRandomSymbol();
      }
      
      // Create symbol instance
      const symbolInstance = createSymbolInstance(symbol, i, this.reelIndex);
      
      // Create symbol container
      const symbolContainer = this.createSymbolContainer(symbolInstance);
      
      // Position symbol
      symbolContainer.position.y = i * symbolHeight;
      
      // Add to container
      this.symbolsContainer.addChild(symbolContainer);
      
      // Add to symbols array
      this.symbols.push(symbolInstance);
    }
    
    // this.getVisibleSymbols().map(s => s.symbol.type);
  }
  /**
   * Tween a property to a target value
   * @param property Property to tween
   * @param target Target value
   * @param time Duration in milliseconds
   * @param easing Easing function
   * @param onchange Callback on change
   * @param oncomplete Callback on complete
   */
  private tweenTo(
    property: 'reelPosition',
    target: number,
    time: number,
    easing: (t: number) => number,
    onchange?: ((tween: any) => void) | undefined,
    oncomplete?: ((tween: any) => void) | undefined
  ): void {
    const tween = {
      object: this,
      property,
      propertyBeginValue: this[property],
      target,
      easing,
      time,
      change: onchange,
      complete: oncomplete,
      start: Date.now(),
    };
    
    this.tweening.push(tween);
    
    return;
  }
  
  /**
   * Update all active tweens
   */
  private updateTweens(): void {
    if (this.tweening.length <= 0) {
      return;
    }
    
    const now = Date.now();
    const remove = [];
    
    for (let i = 0; i < this.tweening.length; i++) {
      const t = this.tweening[i];
      const phase = Math.min(1, (now - t.start) / t.time);
      
      t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
      
      if (t.change) t.change(t);
      
      if (phase === 1) {
        t.object[t.property] = t.target;
        if (t.complete) t.complete(t);
        remove.push(t);
      }
    }
    
    for (let i = 0; i < remove.length; i++) {
      this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
    }
  }
  
  /**
   * Linear interpolation function
   * @param a1 Start value
   * @param a2 End value
   * @param t Progress (0-1)
   * @returns Interpolated value
   */
  private lerp(a1: number, a2: number, t: number): number {
    return a1 * (1 - t) + a2 * t;
  }
  
  /**
   * Backout easing function
   * @param amount Amount of backout
   * @returns Easing function
   */
  private backout(amount: number): (t: number) => number {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }
  
  public getSymbols(): SymbolInstance[] {
    return this.symbols;
  }
  /**
   * Get the visible symbols
   * @returns Array of visible symbols
   */
  public getVisibleSymbols(): SymbolInstance[] {
    // Get Visible symbols visually container.y >= 200 && container.y <= 400

    var result: SymbolInstance[] = new Array<SymbolInstance>(this.config.visibleSymbols);
    const symbolHeight = this.config.symbolSize + this.config.symbolSpacing;
    const topY = this.extraSymbols * symbolHeight;
    const btmY = (this.config.visibleSymbols+this.extraSymbols) * symbolHeight;
    
    for (let i = 0; i < this.symbols.length; i++) {
      const symbolContainer = this.symbolsContainer.children[i] as PIXI.Container;
      if (symbolContainer.position.y >= topY && symbolContainer.position.y < btmY) {        
        // Get a new random symbol
        result[Math.floor(symbolContainer.position.y/symbolHeight)-this.extraSymbols] = this.symbols[i];
      }
    }


    // const result = this.symbols.slice(this.extraSymbols, this.extraSymbols + this.config.visibleSymbols);
    // console.info('Visible symbols:', result.map(s => [s.symbol.emoji, s.row, s.column]));
    return result;
  }
  
  /**
   * Set the visible symbols
   * @param symbols Symbols to set
   */
  public setVisibleSymbols(symbols: Symbol[]): void {
    if (symbols.length !== this.config.visibleSymbols) {
      throw new Error(`Expected ${this.config.visibleSymbols} symbols, got ${symbols.length}`);
    }
    
    // Update the symbols
    for (let i = 0; i < this.config.visibleSymbols; i++) {
      const symbolIndex = this.extraSymbols + i;
      const symbol = symbols[i];
      
      // Update the symbol instance
      this.symbols[symbolIndex] = createSymbolInstance(symbol, i, this.reelIndex);
      
      // Update the symbol container
      const symbolContainer = this.symbolsContainer.children[symbolIndex] as PIXI.Container;
      symbolContainer.removeChildren();
      
      // Create new symbol container
      const newSymbolContainer = this.createSymbolContainer(this.symbols[symbolIndex]);
      
      // Copy position
      newSymbolContainer.position.y = symbolContainer.position.y;
      
      // Replace old container with new one
      this.symbolsContainer.removeChildAt(symbolIndex);
      this.symbolsContainer.addChildAt(newSymbolContainer, symbolIndex);
    }
  }
  
  /**
   * Highlight winning symbols
   * @param winningSymbols Array of winning symbols
   */
  public highlightWinningSymbols(winningSymbols: SymbolInstance[]): void {
    
    // Check each visible symbol
    for (let i = 0; i < this.symbols.length; i++) {
      const symbolContainer = this.symbolsContainer.children[i] as PIXI.Container;
      
      // Check if this symbol is in the winning symbols
      const isWinning = winningSymbols.some(winningSymbol => 
        winningSymbol.row === this.symbols[i].row && 
        winningSymbol.column === this.symbols[i].column
      );
      
      // Highlight if winning
      if (isWinning) {
        // Add highlight effect
        const highlight = new PIXI.Graphics()
          .rect(0, 0, this.config.symbolSize, this.config.symbolSize)
          .fill(
            {
              color: 0xffff00, alpha: 0.5
            }
          );
        highlight.label = 'highlight';
        symbolContainer.addChild(highlight);
      }
    }
  }
  
  /**
   * Clear winning symbol highlights
   */
  public clearWinningHighlights(): void {
    // Get visible symbols
    const visibleSymbols = this.getVisibleSymbols();
    
    // Clear highlights from each visible symbol
    for (let i = 0; i < visibleSymbols.length; i++) {
      const symbolIndex = this.extraSymbols + i;
      const symbolContainer = this.symbolsContainer.children[symbolIndex] as PIXI.Container;
      
      // Remove highlight if it exists
      const highlight = symbolContainer.getChildByName('highlight');
      if (highlight) {
        symbolContainer.removeChild(highlight);
      }
    }
  }
}
