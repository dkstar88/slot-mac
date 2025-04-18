import { describe, expect, it } from 'vitest'
import { sliceArray, checkSymbolsMatch, detectWinningCombinations } from '../../src/core/winning-patterns'
import { createSymbolInstanceFromType, SYMBOLS } from '../../src/core/symbols';
import { SymbolType } from '../../src/types/symbols';
import { WinCombinationType } from '../../src/types/winning-combinations';


describe('Slicing Array', () => {

    const board = [
        ['A1', 'B1', 'C1', 'D1', 'E1'],
        ['A2', 'B2', 'C2', 'D2', 'E2'],
        ['A3', 'B3', 'C3', 'D3', 'E3'],
    ]
    
    it('should find matching symbols', () => {
        const slices = [...sliceArray(board, 1, 3)]
        expect(slices.length).toBe(9)
        expect(slices).toStrictEqual([
            [['A1', 'B1', 'C1']], [['B1', 'C1', 'D1']], [['C1', 'D1', 'E1']],
            [['A2', 'B2', 'C2']], [['B2', 'C2', 'D2']], [['C2', 'D2', 'E2']],
            [['A3', 'B3', 'C3']], [['B3', 'C3', 'D3']], [['C3', 'D3', 'E3']],
        ])
    })

    it('should find matching symbols with different dimensions', () => {
        const slices = [...sliceArray(board, 2, 2)]
        expect(slices.length).toBe(8)
        expect(slices).toStrictEqual([
            [['A1', 'B1'], ['A2', 'B2']],
            [['B1', 'C1'], ['B2', 'C2']],
            [['C1', 'D1'], ['C2', 'D2']],
            [['D1', 'E1'], ['D2', 'E2']],
            [['A2', 'B2'], ['A3', 'B3']],
            [['B2', 'C2'], ['B3', 'C3']],
            [['C2', 'D2'], ['C3', 'D3']],
            [['D2', 'E2'], ['D3', 'E3']],
        ])
    })
    

});


describe('Check Symbols Match (checkSymbolsMatch)', () => {

    it('should find matching symbols', () => {
        const board = [
            [
                createSymbolInstanceFromType(SymbolType.BAR, 1, 1), 
                createSymbolInstanceFromType(SymbolType.BAR, 1, 2), 
                createSymbolInstanceFromType(SymbolType.BAR, 1, 3)
            ],
            [
                createSymbolInstanceFromType(SymbolType.LEMON, 2, 1), 
                createSymbolInstanceFromType(SymbolType.CHERRY, 2, 2), 
                createSymbolInstanceFromType(SymbolType.LEMON, 2, 3)
            ],
            [
                createSymbolInstanceFromType(SymbolType.BAR, 3, 1), 
                createSymbolInstanceFromType(SymbolType.CHERRY, 3, 2), 
                createSymbolInstanceFromType(SymbolType.BAR, 3, 3)
            ],            
        ]

        const patternMatrix = [
            [1, 1, 1],
        ]

        const matches = [...checkSymbolsMatch(board, patternMatrix)]
        expect(matches.length).toBe(1)
        expect(matches).toStrictEqual([
            [
                createSymbolInstanceFromType(SymbolType.BAR, 1, 1), 
                createSymbolInstanceFromType(SymbolType.BAR, 1, 2), 
                createSymbolInstanceFromType(SymbolType.BAR, 1, 3)
            ],
        ])
    });

    it('should find matching symbols with empty', () => {
        const board = [
            [
                createSymbolInstanceFromType(SymbolType.BAR, 1, 1), 
                createSymbolInstanceFromType(SymbolType.CHERRY, 1, 2), 
                createSymbolInstanceFromType(SymbolType.BAR, 1, 3)
            ],
            [
                createSymbolInstanceFromType(SymbolType.LEMON, 2, 1), 
                createSymbolInstanceFromType(SymbolType.BAR, 2, 2), 
                createSymbolInstanceFromType(SymbolType.LEMON, 2, 3)
            ],
            [
                createSymbolInstanceFromType(SymbolType.BAR, 3, 1), 
                createSymbolInstanceFromType(SymbolType.CHERRY, 3, 2), 
                createSymbolInstanceFromType(SymbolType.BAR, 3, 3)
            ],            
        ]

        const patternMatrix = [[1, 0, 1], [0, 1, 0], [1, 0, 1]]

        const matches = [...checkSymbolsMatch(board, patternMatrix)]
        expect(matches.length).toBe(1)
        expect(matches).toStrictEqual([
            [
                createSymbolInstanceFromType(SymbolType.BAR, 1, 1),
                createSymbolInstanceFromType(SymbolType.BAR, 1, 3), 
                createSymbolInstanceFromType(SymbolType.BAR, 2, 2),
                createSymbolInstanceFromType(SymbolType.BAR, 3, 1), 
                createSymbolInstanceFromType(SymbolType.BAR, 3, 3), 
            ],
        ])
    });    

    

});

describe('Check Winning Patterns', () => {

    it('Check against 1 across winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.BAR,     SymbolType.BAR,     SymbolType.LEMON,   SymbolType.SEVEN],
            [SymbolType.LEMON,  SymbolType.CHERRY,  SymbolType.LEMON,   SymbolType.LEMON,   SymbolType.BAR],
            [SymbolType.LEMON,  SymbolType.BELL,    SymbolType.LEMON,   SymbolType.ORANGE,  SymbolType.BELL],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        expect(winnings.length).toBe(1);
        expect(winnings[0].pattern.type).toBe(WinCombinationType.THREE_ACROSS);
        winnings[0].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.BAR);
        });

    });

    it('Check against 2 across winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.BAR,     SymbolType.BAR,     SymbolType.LEMON,   SymbolType.SEVEN],
            [SymbolType.LEMON,  SymbolType.CHERRY,  SymbolType.CHERRY,   SymbolType.CHERRY,   SymbolType.BAR],
            [SymbolType.LEMON,  SymbolType.BELL,    SymbolType.LEMON,   SymbolType.ORANGE,  SymbolType.BELL],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        expect(winnings.length).toBe(2);

        expect(winnings[0].pattern.type).toBe(WinCombinationType.THREE_ACROSS);
        winnings[0].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.BAR);
        });

        expect(winnings[1].pattern.type).toBe(WinCombinationType.THREE_ACROSS);
        winnings[1].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.CHERRY);
        });

    });    

    it('Check against 2 down winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.CHERRY,     SymbolType.LEMON,     SymbolType.LEMON,   SymbolType.BELL],
            [SymbolType.LEMON,  SymbolType.CHERRY,  SymbolType.ORANGE,   SymbolType.CHERRY,   SymbolType.BELL],
            [SymbolType.LEMON,  SymbolType.CHERRY,    SymbolType.LEMON,   SymbolType.ORANGE,  SymbolType.BELL],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        expect(winnings.length).toBe(2);

        expect(winnings[0].pattern.type).toBe(WinCombinationType.THREE_DOWN);
        winnings[0].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.CHERRY);
        });

        expect(winnings[1].pattern.type).toBe(WinCombinationType.THREE_DOWN);
        winnings[1].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.BELL);
        });

    });       

    it('Check against 2 diagonal winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.ORANGE,     SymbolType.LEMON,     SymbolType.LEMON,   SymbolType.BELL],
            [SymbolType.LEMON,  SymbolType.BAR,  SymbolType.ORANGE,   SymbolType.CHERRY,   SymbolType.BELL],
            [SymbolType.LEMON,  SymbolType.CHERRY,    SymbolType.BAR,   SymbolType.ORANGE,  SymbolType.CHERRY],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        expect(winnings.length).toBe(2);

        expect(winnings[0].pattern.type).toBe(WinCombinationType.THREE_DIAGONAL);
        winnings[0].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.BAR);
        });

        expect(winnings[1].pattern.type).toBe(WinCombinationType.THREE_DIAGONAL);
        winnings[1].symbols.forEach(symbol => {
            expect(symbol.symbol.type).toBe(SymbolType.ORANGE);
        });

    });

    it('Check against 4 across winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.BAR,     SymbolType.BAR,     SymbolType.BAR,   SymbolType.SEVEN],
            [SymbolType.LEMON,  SymbolType.CHERRY,  SymbolType.LEMON,   SymbolType.LEMON,   SymbolType.BAR],
            [SymbolType.LEMON,  SymbolType.LEMON,    SymbolType.LEMON,   SymbolType.LEMON,  SymbolType.BELL],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        const winningPatternTypes = winnings.map(winning => [winning.pattern.type, winning.symbols[0].symbol.type]);

        expect(winningPatternTypes).toContainEqual([WinCombinationType.FOUR_ACROSS, SymbolType.BAR]);
        expect(winningPatternTypes).toContainEqual([WinCombinationType.FOUR_ACROSS, SymbolType.LEMON]);

    });

    it('Check against 5 across winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.BAR,     SymbolType.BAR,     SymbolType.BAR,   SymbolType.BAR],
            [SymbolType.LEMON,  SymbolType.CHERRY,  SymbolType.LEMON,   SymbolType.LEMON,   SymbolType.BAR],
            [SymbolType.LEMON,  SymbolType.LEMON,    SymbolType.LEMON,   SymbolType.LEMON,  SymbolType.LEMON],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        const winningPatternTypes = winnings.map(winning => [winning.pattern.type, winning.symbols[0].symbol.type]);
        expect(winningPatternTypes).toContainEqual([WinCombinationType.FIVE_ACROSS, SymbolType.BAR]);
        expect(winningPatternTypes).toContainEqual([WinCombinationType.FIVE_ACROSS, SymbolType.LEMON]);

    });     

    it('Check against 5 star winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.CHERRY,     SymbolType.BAR,     SymbolType.BAR,   SymbolType.CHERRY],
            [SymbolType.LEMON,  SymbolType.BAR,  SymbolType.LEMON,   SymbolType.LEMON,   SymbolType.BAR],
            [SymbolType.BAR,  SymbolType.LEMON,    SymbolType.BAR,   SymbolType.LEMON,  SymbolType.LEMON],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        const winningPatternTypes = winnings.map(winning => [winning.pattern.type, winning.symbols[0].symbol.type]);
        expect(winningPatternTypes).toContainEqual([WinCombinationType.FIVE_MIRRORED_DIAGONAL, SymbolType.BAR]);

    });

    it('Check against jackpot winning patterns', () => {


        const board = [
            [SymbolType.BAR,    SymbolType.BAR,   SymbolType.BAR,     SymbolType.BAR,   SymbolType.BAR],
            [SymbolType.BAR,  SymbolType.BAR,  SymbolType.BAR,   SymbolType.BAR,   SymbolType.BAR],
            [SymbolType.BAR,  SymbolType.BAR,    SymbolType.BAR,   SymbolType.BAR,  SymbolType.BAR],
        ].map((row, rowIndex) =>
            row.map((symbolType, colIndex) => createSymbolInstanceFromType(symbolType, rowIndex + 1, colIndex + 1))
        );

        const winnings = detectWinningCombinations(board);
        const winningPatternTypes = winnings.map(winning => winning.pattern.type);
        expect(winningPatternTypes).toContainEqual(WinCombinationType.FIFTEEN_ALL_MATCH);


    });     

});