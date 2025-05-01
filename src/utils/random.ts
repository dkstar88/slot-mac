/**
 * Utility functions for random number generation
 */

/**
 * Generate a random integer between min and max (inclusive)
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 * @param min Minimum value
 * @param max Maximum value
 * @returns Random float
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Select a random item from an array
 * @param array Array to select from
 * @returns Random item from the array
 */
export function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Select a random item from an array based on weights
 * @param items Array of items to select from
 * @param weights Array of weights corresponding to each item
 * @returns Randomly selected item
 */
export function weightedRandomItem<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error("Items and weights arrays must have the same length");
  }

  if (items.length === 0) {
    throw new Error("Items array cannot be empty");
  }

  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  // Generate a random value between 0 and totalWeight
  const randomValue = Math.random() * totalWeight;

  // Find the item that corresponds to the random value
  let weightSum = 0;
  for (let i = 0; i < items.length; i++) {
    weightSum += weights[i];
    if (randomValue <= weightSum) {
      return items[i];
    }
  }

  // Fallback (should never happen)
  return items[items.length - 1];
}

/**
 * Shuffle an array using the Fisher-Yates algorithm
 * @param array Array to shuffle
 * @returns Shuffled array (modifies original array)
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generate a random seed for deterministic random number generation
 * @returns Random seed
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

/**
 * Seeded random number generator
 */
export class SeededRandom {
  private seed: number;

  /**
   * Constructor
   * @param seed Seed for the random number generator
   */
  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate a random number between 0 and 1
   * @returns Random number
   */
  random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate a random integer between min and max (inclusive)
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random integer
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float between min and max
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random float
   */
  randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * Select a random item from an array
   * @param array Array to select from
   * @returns Random item from the array
   */
  randomItem<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }

  /**
   * Select a random item from an array based on weights
   * @param items Array of items to select from
   * @param weights Array of weights corresponding to each item
   * @returns Randomly selected item
   */
  weightedRandomItem<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error("Items and weights arrays must have the same length");
    }

    if (items.length === 0) {
      throw new Error("Items array cannot be empty");
    }

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    // Generate a random value between 0 and totalWeight
    const randomValue = this.random() * totalWeight;

    // Find the item that corresponds to the random value
    let weightSum = 0;
    for (let i = 0; i < items.length; i++) {
      weightSum += weights[i];
      if (randomValue <= weightSum) {
        return items[i];
      }
    }

    // Fallback (should never happen)
    return items[items.length - 1];
  }

  /**
   * Shuffle an array using the Fisher-Yates algorithm
   * @param array Array to shuffle
   * @returns Shuffled array (modifies original array)
   */
  shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
