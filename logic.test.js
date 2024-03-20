import { Ship, Gameboard } from './src/logic.js';

describe('Ship class', () => {
    test('test hit(), issunk() methods', () => {
        const ship = new Ship(2);
        ship.hit();
        expect(ship.hits).toBe(1);
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });
});

describe('Gameboard class', () => {
    test('All methods', () => {
        const gameboard = new Gameboard();
        gameboard.checkIns(0, 0, 1, 0, 4);
        expect(gameboard.checkIns(0, 0, 1, 0, 4)).toBe(true);
        gameboard.insert(0, 0, 1, 0, 4);
        expect(gameboard.board[0][0]).toBeInstanceOf(Ship);
        expect(gameboard.board[1][0]).toBeInstanceOf(Ship);
        expect(gameboard.board[2][0]).toBeInstanceOf(Ship);
        expect(gameboard.board[3][0]).toBeInstanceOf(Ship);
        expect(gameboard.board[0][1]).not.toBeInstanceOf(Ship);
    });

    test('Random method', () => {
        const gameboard = new Gameboard();
        const result = gameboard.random();

        expect(result).toHaveProperty('x');
        expect(result).toHaveProperty('y');
        expect(result).toHaveProperty('sense');
        expect(result).toHaveProperty('lon');
        expect(result.sense.length).toBe(2);
        expect(typeof result.x).toBe('number');
        expect(typeof result.y).toBe('number');
        expect(typeof result.lon).toBe('number');
    });

    test('receiveAttack method', () => {
        const gameboard = new Gameboard();
        gameboard.insert(0, 0, 1, 0, 4);
        expect(gameboard.receiveAttack(0, 2)).toBe('failed');
        expect(gameboard.receiveAttack(0, 0)).toBe(true);
        expect(gameboard.autoAttack()).toHaveProperty('attack');
        expect(gameboard.autoAttack()).toHaveProperty('coords');
    });
});