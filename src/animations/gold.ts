import { Container, Spritesheet, Assets } from "pixi.js";
import { ParticleEmitter } from "./emitter";

/**
 * Emit gold coins based on payout amount
 * @param amount Number of coins to emit
 */
export function emitGoldCoins(
  centerX: number,
  centerY: number,
  screen_width: number,
  screen_height: number,
  amount: number,
  ctx: Container,
): void {
  const goldCoinSpritesheet = Assets.get("goldAnim") as Spritesheet;

  // Calculate number of coins to emit (cap at a reasonable maximum)
  const numCoins = Math.min(amount, 50);

  ParticleEmitter.emitOut(
    goldCoinSpritesheet.animations["rotating_coin"],
    centerX,
    centerY,
    screen_width,
    screen_height,
    numCoins,
    ctx,
  );
}
