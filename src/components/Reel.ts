import * as PIXI from 'pixi.js';
import { BlurFilter } from 'pixi.js';
import type { Glyph, GlyphInstance } from '../types/glyphs';
import { getRandomGlyph, createGlyphInstance } from '../core/glyphs';
import { GameEventType } from '../types/events';
import { publishEvent } from '../utils/event-system';
import { GlyphContainer } from './GlyphContainer';
import { TweenManager } from '../utils/tween';
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
  glyphSize: number;
  
  /** Spacing between symbols */
  glyphSpacing: number;
  
  spinSpeed: number;
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
  glyphSize: 100,
  glyphSpacing: 0,
  spinSpeed: 4,
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
  private glyphsContainer: PIXI.Container;
  
  /** Mask for the symbols container */
  public glyphsMask: PIXI.Graphics;
  
  /** Array of symbol instances */
  private glyphs: GlyphInstance[] = [];
  
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
  private extraGlyphs: number = 5;
  
  /** Tween for animation */
  private tweenManager: TweenManager | null = null;


  /**
   * Constructor
   * @param reelIndex Index of this reel
   * @param config Configuration for the reel
   */
  constructor(reelIndex: number, config: Partial<ReelConfig> = {}) {
    super();
    
    this.reelIndex = reelIndex;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.tweenManager = new TweenManager();
        
    const shadowed = new PIXI.Sprite(
      {
        texture: PIXI.Assets.get('reel'),
        width: this.config.width,
        height: this.config.height,
      }
    );
    shadowed.anchor.set(0, 0);
    this.addChild(shadowed);
        
    // Create container for symbols
    this.glyphsContainer = new PIXI.Container();
    this.addChild(this.glyphsContainer);
    

        
    // Create mask
    this.glyphsMask = new PIXI.Graphics();
    this.glyphsMask.rect(0, 0, this.config.width, this.config.height).fill(0xffffff);
    this.addChild(this.glyphsMask);


    // Apply mask to symbols container
    this.glyphsContainer.mask = this.glyphsMask;
    
    // Create blur filter
    this.blurFilter = new BlurFilter();
    this.blurFilter.blurX = 0;
    this.blurFilter.blurY = 0;
    this.glyphsContainer.filters = [this.blurFilter];
    
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
    this.glyphsContainer.removeChildren();
    this.glyphs = [];
    
    // Calculate total number of symbols (visible + extra)
    const totalSymbols = this.config.visibleSymbols + this.extraGlyphs;
    
    // Create symbols
    for (let i = 0; i < totalSymbols; i++) {
      // Create symbol instance
      const symbol = getRandomGlyph();
      const symbolInstance = createGlyphInstance(symbol, i, this.reelIndex);
      
      // Create symbol container
      const symbolContainer = new GlyphContainer({ size: this.config.glyphSize, symbol: symbolInstance.glyph.type });
      
      // Position symbol
      symbolContainer.position.y = i * (this.config.glyphSize + this.config.glyphSpacing);
      // symbolContainer.setText('' + i)
      
      // Add to container
      this.glyphsContainer.addChild(symbolContainer);
      
      // Add to symbols array
      this.glyphs.push(symbolInstance);

    }
    
    // Position symbols container to show only visible symbols
    this.glyphsContainer.position.y = (-this.extraGlyphs+1) * (this.config.glyphSize + this.config.glyphSpacing);
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
    const target = (this.extraGlyphs + this.config.visibleSymbols) * this.config.spinSpeed - 3;
    
    // Calculate spin duration with some variety
    const time = 1500 + this.reelIndex * 600 + extra * 600;
    
    // Stop any existing tween
    this.tweenManager!.reset();
    
    this.tweenManager!.tween(
      this,
      time,
      'reelPosition',
      target,
      0,
      this.tweenManager!.backout(0.8),
      undefined,
      () => {
        // Animation complete
        this.stopSpin();
      }
    );

  }
  
  /**
   * Stop spinning the reel
   * @param targetSymbols Symbols to show when the reel stops
   */
  public stopSpin(): void {
    /* TODO - REMOVE - Currently not working tween always complete at the right position, no need to scroll again */

    if (!this.isSpinning) return;

    console.log(`Reel ${this.reelIndex} stopSpin called`);

    // For immediate stop, we can cancel current tweens and create a new one with shorter duration
    this.tweenManager!.reset();
    
    // Calculate the nearest stopping point (complete symbol)
    const symbolHeight = this.config.glyphSize + this.config.glyphSpacing;
    const targetPosition = Math.ceil(this.reelPosition / symbolHeight) * symbolHeight;

    console.log(`Reel ${this.reelIndex} at ${this.reelPosition} stopping at position: ${targetPosition}`);
    this.onSpinComplete();
    // Create a short tween to stop at the next symbol boundary
    // if (this.reelPosition != targetPosition) {
    //   this.currentTween = new Tween(this);
    //   this.currentTween
    //     .from({ reelPosition: this.reelPosition })
    //     .to({ reelPosition: targetPosition });
    //   this.currentTween.time = 100 + this.config.spinStopDelay;
    //   this.currentTween.easing = Easing.backOut(0.8);
    //   this.currentTween.on('end', () => this.onSpinComplete());
    //   this.currentTween.start();
    // } else {
    //   // If already at target position, call spin complete directly
    //   this.onSpinComplete();
    // }
  }
  
  /**
   * Called when spin animation completes
   */
  public onSpinComplete(): void {
    console.log(`Reel ${this.reelIndex} onSpinComplete called`);
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
  private update(_: PIXI.Ticker): void {
    // Log first few updates to confirm ticker is working
    if (Reel.updateCount < 5) {
      Reel.updateCount++;
    }
       
    // Update blur filter based on speed
    this.blurFilter.blurY = (this.reelPosition - this.previousReelPosition) * 8;
    this.previousReelPosition = this.reelPosition;
    
    // Update symbol positions on reel
    const symbolHeight = this.config.glyphSize + this.config.glyphSpacing;
    
    for (let i = 0; i < this.glyphs.length; i++) {
      const symbolContainer = this.glyphsContainer.children[i] as GlyphContainer;
      
      // Calculate new position based on reel position
      symbolContainer.position.y = ((this.reelPosition + i) % this.glyphs.length) * symbolHeight - symbolHeight;
    }    

  }
  
  /**
   * Reset the symbols after spinning
   */
  private resetSymbols(): void {
    // Store the visible symbols before resetting
    const visibleSymbols = this.getTargetSymbols().map(s => s.glyph);
    
    // Reset the position
    const symbolHeight = this.config.glyphSize + this.config.glyphSpacing;
    this.glyphsContainer.position.y = (-this.extraGlyphs+1) * symbolHeight;
    
    // Reset position tracking
    this.reelPosition = 0;
    this.previousReelPosition = 0;
    
    // Reset blur
    this.blurFilter.blurY = 0;
    
    // Clear existing symbols
    this.glyphsContainer.removeChildren();
    this.glyphs = [];
    
    // Calculate total number of symbols (visible + extra)
    const totalSymbols = this.config.visibleSymbols + this.extraGlyphs;
    
    // Create symbols
    for (let i = 0; i < totalSymbols; i++) {
      // Determine which symbol to use
      let symbol;
      if (i >= 0 && i < this.config.visibleSymbols) {
        // For visible positions, use the stored visible symbols
        const visibleIndex = i;
        symbol = visibleSymbols[visibleIndex];
      } else {
        // For non-visible positions, use random symbols
        symbol = getRandomGlyph();
      }
      
      // Create symbol instance
      const symbolInstance = createGlyphInstance(symbol, i, this.reelIndex);
      
      // Create symbol container
      const symbolContainer = new GlyphContainer({ size: this.config.glyphSize, symbol: symbolInstance.glyph.type });
      
      // Position symbol
      symbolContainer.position.y = i * symbolHeight;
      // symbolContainer.setText('' + i)
      // Add to container
      this.glyphsContainer.addChild(symbolContainer);
      
      // Add to symbols array
      this.glyphs.push(symbolInstance);
    }
    
    // this.getVisibleSymbols().map(s => s.symbol.type);
  }
  
  public getReelIndex(): number {
    return this.reelIndex;
  }

  public getSymbols(): GlyphInstance[] {
    return this.glyphs;
  }


  public getTargetSymbols(): GlyphInstance[] {
    // Get the target symbols (the ones that are currently visible)
    const targetSymbols = this.glyphs.slice(0, this.config.visibleSymbols);
    return targetSymbols;
  }
  /**
   * Get the visible symbols
   * @returns Array of visible symbols
   */
  public getVisibleSymbols(): GlyphInstance[] {
    // Get Visible symbols visually container.y >= 200 && container.y <= 400

    var result: GlyphInstance[] = new Array<GlyphInstance>(this.config.visibleSymbols);
    const symbolHeight = this.config.glyphSize + this.config.glyphSpacing;
    const topY = (this.extraGlyphs-1) * symbolHeight;
    const btmY = (this.config.visibleSymbols+this.extraGlyphs-1) * symbolHeight;
    
    for (let i = 0; i < this.glyphs.length; i++) {
      const symbolContainer = this.glyphsContainer.children[i] as PIXI.Container;
      if (symbolContainer.position.y >= topY && symbolContainer.position.y < btmY) {        
        // Get a new random symbol
        result[Math.floor(symbolContainer.position.y/symbolHeight)-this.extraGlyphs+1] = this.glyphs[i];
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
  public setVisibleSymbols(symbols: Glyph[] | GlyphInstance[]): void {
    if (symbols.length !== this.config.visibleSymbols) {
      throw new Error(`Expected ${this.config.visibleSymbols} symbols, got ${symbols.length}`);
    }
    
    // Update the symbols
    for (let i = 0; i < this.config.visibleSymbols; i++) {
      const symbolIndex = i;
      const symbol = symbols[i];
      
      // Update the symbol instance
      if ('type' in symbol) {
        this.glyphs[symbolIndex] = createGlyphInstance(symbol as Glyph, i, this.reelIndex);
      } else {
        this.glyphs[symbolIndex] = symbol as GlyphInstance;
      }
      
      // Update the symbol container
      const symbolContainer = this.glyphsContainer.children[symbolIndex] as GlyphContainer;
      symbolContainer.setSymbol(this.glyphs[symbolIndex].glyph.type);
      
      console.log(`Reel ${this.reelIndex} setVisibleSymbols: ${symbolIndex} ${this.glyphs[symbolIndex].glyph.emoji}`);
    }
  }
  
  /**
   * Highlight winning symbols
   * @param winningSymbols Array of winning symbols
   */
  public highlightWinningSymbols(winningSymbols: GlyphInstance[]): void {
    
    // Check each visible symbol
    for (let i = 0; i < this.glyphs.length; i++) {
      const symbolContainer = this.glyphsContainer.getChildAt(i) as GlyphContainer;
      
      // Check if this symbol is in the winning symbols
      const isWinning = winningSymbols.some(winningSymbol => 
        winningSymbol.row === this.glyphs[i].row && 
        winningSymbol.column === this.glyphs[i].column
      );
      
      // Highlight if winning
      if (isWinning) {
        symbolContainer.setIsHighlighted(true);
        
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
      const symbolIndex = i;
      const symbolContainer = this.glyphsContainer.getChildAt(symbolIndex) as GlyphContainer;
      symbolContainer.setIsHighlighted(false);
    }
  }
}
