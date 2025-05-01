import * as PIXI from "pixi.js";
import { Button } from "./Button";
import { publishEvent } from "../utils/event-system";
import { GameEventType } from "../types/events";
import logger from "../utils/logger";

/**
 * Configuration for the high scores scene
 */
export interface HighScoresSceneConfig {
  width: number;
  height: number;
}

/**
 * Interface for a high score entry
 */
export interface HighScoreEntry {
  name: string;
  score: number;
  date: string;
}

/**
 * A container that displays the high scores scene
 */
export class HighScoresScene extends PIXI.Container {
  private config: HighScoresSceneConfig;
  private title!: PIXI.Text;
  private scoreTexts: PIXI.Text[] = [];
  private backButton!: Button;
  private highScores: HighScoreEntry[] = [];

  constructor(config: HighScoresSceneConfig) {
    super();
    this.config = config;
    this.init();
  }

  private init() {
    // Create title
    this.title = new PIXI.Text({
      text: "High Scores",
      style: {
        fontFamily: '"Gill Sans", sans-serif',
        fontSize: 48,
        fill: 0xffffff,
        align: "center",
      },
    });
    this.title.anchor.set(0.5, 0);
    this.title.position.set(this.config.width / 2, 100);
    this.addChild(this.title);

    // Create back button
    this.backButton = new Button({
      width: 150,
      height: 50,
      color: 0x4caf50,
      text: "Back",
      textColor: 0xffffff,
      fontSize: 24,
      rounded: 10,
      hoverColor: 0x66bb6a,
      downColor: 0x388e3c,
      onClicked: () => {
        publishEvent(GameEventType.MENU_QUIT, {});
      },
    });
    this.backButton.position.set(
      (this.config.width - 150) / 2,
      this.config.height - 100,
    );
    this.addChild(this.backButton);

    // Load high scores from localStorage
    this.loadHighScores();

    // Display high scores
    this.displayHighScores();
  }

  /**
   * Load high scores from localStorage
   */
  private loadHighScores() {
    try {
      const savedScores = localStorage.getItem("fruitfulFortune_highScores");
      if (savedScores) {
        this.highScores = JSON.parse(savedScores);
      } else {
        // Default high scores if none exist
        this.highScores = [
          { name: "Player 1", score: 1000, date: "2025-04-01" },
          { name: "Player 2", score: 800, date: "2025-04-02" },
          { name: "Player 3", score: 600, date: "2025-04-03" },
          { name: "Player 4", score: 400, date: "2025-04-04" },
          { name: "Player 5", score: 200, date: "2025-04-05" },
        ];
      }
    } catch (error) {
      logger.error("Failed to load high scores:", error);
      this.highScores = [];
    }
  }

  /**
   * Display high scores on the scene
   */
  private displayHighScores() {
    // Clear existing score texts
    this.scoreTexts.forEach((text) => {
      this.removeChild(text);
      text.destroy();
    });
    this.scoreTexts = [];

    // Sort high scores by score (descending)
    const sortedScores = [...this.highScores].sort((a, b) => b.score - a.score);

    // Display top 5 scores
    const startY = 200;
    const spacing = 50;
    const maxScores = Math.min(5, sortedScores.length);

    for (let i = 0; i < maxScores; i++) {
      const score = sortedScores[i];
      const scoreText = new PIXI.Text({
        text: `${i + 1}. ${score.name} - ${score.score}`,
        style: {
          fontFamily: '"Gill Sans", sans-serif',
          fontSize: 24,
          fill: 0xffffff,
          align: "center",
        },
      });
      scoreText.anchor.set(0.5, 0);
      scoreText.position.set(this.config.width / 2, startY + i * spacing);
      this.addChild(scoreText);
      this.scoreTexts.push(scoreText);
    }

    // Display message if no scores
    if (sortedScores.length === 0) {
      const noScoresText = new PIXI.Text({
        text: "No high scores yet!",
        style: {
          fontFamily: '"Gill Sans", sans-serif',
          fontSize: 24,
          fill: 0xffffff,
          align: "center",
        },
      });
      noScoresText.anchor.set(0.5, 0);
      noScoresText.position.set(this.config.width / 2, startY);
      this.addChild(noScoresText);
      this.scoreTexts.push(noScoresText);
    }
  }

  /**
   * Add a new high score
   * @param name Player name
   * @param score Score value
   */
  addHighScore(name: string, score: number) {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    this.highScores.push({ name, score, date });

    // Sort and keep only top 10 scores
    this.highScores.sort((a, b) => b.score - a.score);
    if (this.highScores.length > 10) {
      this.highScores = this.highScores.slice(0, 10);
    }

    // Save to localStorage
    try {
      localStorage.setItem(
        "fruitfulFortune_highScores",
        JSON.stringify(this.highScores),
      );
    } catch (error) {
      logger.error("Failed to save high scores:", error);
    }

    // Update display
    this.displayHighScores();
  }

  /**
   * Show the high scores scene
   */
  show() {
    this.visible = true;
    this.loadHighScores();
    this.displayHighScores();
  }

  /**
   * Hide the high scores scene
   */
  hide() {
    this.visible = false;
  }
}
