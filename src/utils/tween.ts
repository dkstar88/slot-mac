import { Ticker } from "pixi.js";

export interface TweenObject {
  object: any;
  time: number;
  property: string;
  propertyBeginValue: number;
  target: number;
  start: number;
  easing: (t: number) => number;
  change?: ((tween: TweenObject) => void) | undefined;
  complete?: ((tween: TweenObject) => void) | undefined;
}

export class TweenManager {
  private tweenings: TweenObject[] = [];
  constructor() {
    this.tweenings = [];
    Ticker.shared.add(this.update, this);
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
  public tween(
    object: any,
    time: number,
    property: string,
    target: number,
    start: number = 0,
    easing: (t: number) => number = this.backout(0.8),
    change?: ((tween: TweenObject) => void) | undefined,
    complete?: ((tween: TweenObject) => void) | undefined,
  ): void {
    const params: TweenObject = {
      object,
      time,
      property,
      propertyBeginValue: object[property],
      target,
      start: Date.now() + start,
      easing,
      change: change,
      complete: complete,
    };
    this.tweenings.push(params);
  }

  public reset(): void {
    this.tweenings = [];
  }
  /**
   * Update all active tweens
   */
  public update(): void {
    if (this.tweenings.length <= 0) {
      return;
    }

    const now = Date.now();
    const remove = [];

    for (let i = 0; i < this.tweenings.length; i++) {
      const t = this.tweenings[i];
      const phase = Math.min(1, (now - t.start) / t.time);

      t.object[t.property] = this.lerp(
        t.propertyBeginValue,
        t.target,
        t.easing(phase),
      );

      if (t.change) t.change(t);

      if (phase === 1) {
        t.object[t.property] = t.target;
        if (t.complete) t.complete(t);
        remove.push(t);
      }
    }

    for (let i = 0; i < remove.length; i++) {
      this.tweenings.splice(this.tweenings.indexOf(remove[i]), 1);
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
  public backout(amount: number): (t: number) => number {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }
}
