# Fruitful Fortune Slot Machine

A casual slot machine game built with TypeScript, PixiJS, and Vite.

## Project Overview

Fruitful Fortune is a web-based slot machine game featuring:

- 7 different symbols with varying rarity and payout values
- Multiple winning combinations (3 across, 3 down, 3 diagonal, etc.)
- Coin and multiplier system
- Engaging animations and sound effects

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd slot-mac
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
slot-mac/
├── public/                  # Static assets
│   ├── assets/              # Game assets (images, sounds)
│   │   └── symbols/         # Symbol images
│   └── style.css            # Global styles
├── src/                     # Source code
│   ├── assets/              # Asset management
│   ├── components/          # Game components
│   ├── core/                # Core game logic
│   ├── state/               # Game state management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── main.ts              # Entry point
│   └── vite-env.d.ts        # Vite environment types
├── .gitignore               # Git ignore file
├── eslint.config.mjs        # ESLint configuration
├── index.html               # HTML entry point
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Development Guidelines

### TypeScript

- Use strict typing for all variables, functions, and components
- Define interfaces for all game objects in the `types` directory
- Use enums for predefined sets of values

### PixiJS

- Organize visual elements into logical containers
- Use the PixiJS ticker for animations
- Implement proper cleanup to prevent memory leaks
- Use sprite batching for improved performance

### State Management

- Use a centralized game state
- Implement event-driven communication between components
- Store persistent data (e.g., coin balance) in localStorage

### Code Style

- Follow the ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for all functions and classes
- Keep functions small and focused on a single responsibility

## Game Features

### Symbol System

The game features 7 symbols with different rarity and payout values:

1. Seven (rarest, highest payout)
2. Bar
3. Bell
4. Watermelon
5. Orange
6. Lemon
7. Cherry (most common, lowest payout)

### Winning Combinations

The game detects the following winning combinations:

- 3 Across: Three matching symbols in a horizontal line
- 3 Down: Three matching symbols in a vertical line
- 3 Diagonal: Three matching symbols in a diagonal line
- 4 Across: Four matching symbols in a horizontal line
- 5 Across: Five matching symbols in a horizontal line
- 5 Mirrored Diagonal: Five matching symbols in a mirrored diagonal pattern
- 9 Square: Nine matching symbols forming a 3x3 square
- 15 All Match Jackpot: All 15 symbols match (full board)

### Multiplier System

- Starting with 1x multiplier for basic wins (3 across/3 down)
- Increased multipliers for more complex combinations:
  - 5 across = 2x multiplier
  - 5 mirrored diagonal = 3x multiplier
  - 9 square = 4x multiplier
  - Jackpot = 5x multiplier

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the project for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint to check for code issues

## Future Enhancements

- Bonus rounds with unique features and rewards
- Different visual themes (e.g., Ancient Egypt, Space)
- Progressive jackpot system
- Enhanced UI with bet selection and history log
