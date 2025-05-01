/* eslint-disable prefer-const */
export const DEFAULT_MAIN_CONFIG = {
  /** Width of the game board */
  width: 1024,

  /** Height of the game board */
  height: 768,

  /** Number of rows */
  rows: 3,

  /** Number of columns */
  columns: 5,

  labelFontSize: 16,
  valueFontSize: 16,
  messageFontSize: 32,
  backgroundColor: 0x1099bb,
  textColor: 0xffffff,
  /** Size of each symbol */
  glyphSize: 100,

  /** Spacing between symbols */
  symbolSpacing: 0,

  /** Spacing between reels */
  reelSpacing: 10,

  /** Configuration for the reels */
  reelConfig: {
    spinDuration: 2000,
    spinStartDelay: 0,
    spinStopDelay: 0,
  },

  game: {
    starting_coins: 3,
  },

  board: {
    x: 0,
    y: 0,
    /** Width of the game board */
    width: 550,

    /** Height of the game board */
    height: 350,
  },
};

export let MAIN_CONFIG = DEFAULT_MAIN_CONFIG;
