import { GlyphManager } from "../core/glyphs";
import { GlyphType } from "../types/glyphs";
import { WinningPatternsManager } from "../core/winning-patterns";
import { WinCombinationType } from "../types/winning-combinations";
import logger from "../utils/logger";

interface Charm {
  type: string;
  value: number;
  apply(): void;
  description(): string;
}

// Weight modifier for Glyphs
export class GlyphWeightModifier implements Charm {
  type: string;
  glyphType?: GlyphType;
  value: number;

  constructor(glyphType: GlyphType, value: number) {
    this.type = "weightModifier";
    this.glyphType = glyphType;
    this.value = value;
  }

  apply() {
    // Logic to apply the weight modifier to the glyphs
    // This could involve adjusting the rarity weights of the glyphs in the game

    if (this.glyphType) {
      logger.debug(
        `Applying weight modifier ${this.value} to ${this.glyphType}`,
      );
      GlyphManager.incGlyphWeight(this.glyphType, this.value);
    }
  }

  description() {
    return `Increase ${this.glyphType} appearance chance by ${this.value}%.`;
  }
}

export class GlyphPayoutModifier implements Charm {
  type: string;
  glyphType?: GlyphType;
  value: number;

  constructor(glyphType: GlyphType, value: number) {
    this.type = "payoutModifier";
    this.glyphType = glyphType;
    this.value = value;
  }

  apply() {
    // Logic to apply the payout modifier to the glyphs
    // This could involve adjusting the payout values of the glyphs in the game

    if (this.glyphType) {
      logger.debug(
        `Applying payout modifier ${this.value} to ${this.glyphType}`,
      );
      GlyphManager.incGlyphPayoutValue(this.glyphType, this.value);
    }
  }

  description() {
    return `Increase ${this.glyphType} payout by ${this.value}.`;
  }
}

export class PatternTypeMultiplierModifier implements Charm {
  type: string;
  value: number;
  patternType: WinCombinationType;

  constructor(patternType: WinCombinationType, value: number) {
    this.type = "patternMultiplier";
    this.patternType = patternType;
    this.value = value;
  }

  apply() {
    // Logic to apply the pattern multiplier modifier to the game
    // This could involve adjusting the payout values of the winning patterns in the game

    logger.debug(
      `Applying pattern type ${this.patternType} multiplier ${this.value}`,
    );
    // Example: Adjusting the payout values of winning patterns
    WinningPatternsManager.incTypeMultiplier(this.patternType, this.value);
  }

  description() {
    return `Increase winning pattern ${this.type} multiplier by ${this.value}%.`;
  }
}

export class PatternGroupMultiplierModifier implements Charm {
  type: string;
  value: number;
  group: string;

  constructor(group: string, value: number) {
    this.type = "patternMultiplier";
    this.group = group;
    this.value = value;
  }

  apply() {
    // Logic to apply the pattern multiplier modifier to the game
    // This could involve adjusting the payout values of the winning patterns in the game

    logger.debug(
      `Applying pattern group ${this.group} multiplier ${this.value}`,
    );
    // Example: Adjusting the payout values of winning patterns
    WinningPatternsManager.incGroupMultiplier(this.group, this.value);
  }

  description() {
    return `Increase all ${this.group} winning patterns multiplier by ${this.value}%.`;
  }
}

export class GlobalMultiplierModifier implements Charm {
  type: string;
  value: number;

  constructor(value: number) {
    this.type = "globalMultiplier";
    this.value = value;
  }

  apply() {
    // TODO
  }

  description() {
    return `Increase global multiplier by ${this.value}%.`;
  }
}

/* 
    TODO:
    1. No consecutive wins, must win next
    2. Count left and right edges seamlessly
    3. Add a new Fruit Ninja symbol, when appear, break 5 random slots
    4. 


*/
