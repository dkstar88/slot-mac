import { Container, Ticker } from "pixi.js";

export interface Scene extends Container {
  resize(width: number, height: number): void;
  update?: (time: Ticker) => void;
}
