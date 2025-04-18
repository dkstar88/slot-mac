import { describe, expect, it, beforeEach } from 'vitest'
import { 
    IGameStateManager,
    SpinResult, 
  } from '../../src/types/game-state';

import { createSymbolInstanceFromType } from '../../src/core/symbols'

import { GameStateManagerImpl } from '../../src/state/game-state-manager'
import { SymbolType } from '../../src/types/symbols';

describe('GameStateManager', () => {
  let manager: IGameStateManager

  beforeEach(() => {    
    manager = new GameStateManagerImpl();
    manager.resetState()
  })

  it('should initialize with default state', () => {
    const defaultState = manager.getState()
    expect(defaultState.playerStats.coins).toEqual(100)
    expect(defaultState.playerStats.totalWins).toEqual(0)
  })

  it('should handle spin results update', () => {
    const spinResult: SpinResult = {
      boardSymbols: [
        [
            createSymbolInstanceFromType(SymbolType.BELL, 1, 1), 
            createSymbolInstanceFromType(SymbolType.BELL, 1, 2), 
            createSymbolInstanceFromType(SymbolType.BELL, 1, 3)
        ], 
        [
            createSymbolInstanceFromType(SymbolType.CHERRY, 2, 1), 
            createSymbolInstanceFromType(SymbolType.CHERRY, 2, 2), 
            createSymbolInstanceFromType(SymbolType.CHERRY, 2, 3)
        ], 
    ],
      wins: [
        { 
            symbols: [],
            combinationType: "three-in-a-row",
            baseValue: 100,
            multiplier: 1,
            totalValue: 100
        }
        ],
        totalPayout: 200,
        isJackpot: false
    }
    manager.startSpin();
    manager.endSpin(spinResult)
    const state = manager.getState().playerStats;
    expect(state.coins).toEqual(299)
    expect(state.totalSpins).toEqual(1)
  })

  it('should increase player joins when addCoins', () => {
    manager.addCoins(51)
    const state = manager.getState().playerStats;
    expect(state.coins).toEqual(151)
  })

  it('should deduct bet amount on spin', () => {
    manager.deductCoins(25)
    const state = manager.getState().playerStats;
    expect(state.coins).toEqual(75)
  })
})
