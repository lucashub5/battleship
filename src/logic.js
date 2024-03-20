class Ship {
    constructor(lon = 1) {
        this.lon = lon;
        this.hits = 0;
    }

    hit() {
        this.hits++;
    }

    isSunk() {
        if (this.hits === this.lon) {
            return true;
        }
    }
}

class Gameboard {
    constructor() {
        this.board = this.createBoard();
        this.validAttack = [];
        this.shipsArr = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
        this.ships = 10;
        this.queue = [];
        this.endGame = false;
    }

    createBoard() {
        const board = [];
        const size = 10;

        for (let i = 0; i < size; i++) {
          const row = [];
          for (let j = 0; j < size; j++) {
            row.push(null);
          }
          board.push(row);
        }
        return board;
    }

    checkIns(x, y, senseX, senseY, lon) {
        if (this.shipsArr.length === 0) {
            return false;
        }

        const endX = x + senseX * (lon - 1);
        const endY = y + senseY * (lon - 1);
        if (endX < 0 || endX >= this.board.length || endY < 0 || endY >= this.board[0].length) {
            return false;
        }

        for (let i = 0; i < lon; i++) {
            const currentX = x + senseX * i;
            const currentY = y + senseY * i;
            
            if (this.board[currentX][currentY] !== null) {
                return false;
            }
        }
        return true;
    }

    insert(x, y, senseX, senseY, lon) {
        const shipRemove = this.shipsArr.indexOf(lon);
        this.shipsArr.splice(shipRemove, 1);   
        const ship = new Ship(lon);
        for (let i = 0; i < lon; i++) {
            const currX = x + senseX * i;
            const currY = y + senseY * i;
            this.board[currX][currY] = ship;
        }
    }

    random() {
        while(true) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const lon = this.shipsArr[this.shipsArr.length - 1];
            let sense = [0, 1];

            const odds = [
                [1, 0],
                [0, 1]
              ];

            if (lon > 1) {
                sense = odds[Math.floor(Math.random() * odds.length)];
            }

            const insert = this.checkIns(x, y, sense[0], sense[1], lon);

            if (insert) {
                return { x, y, sense: [sense[0], sense[1]], lon };
            }
        }
    }

    receiveAttack(x, y) {
        if (this.validAttack.some(cell => cell[0] === x && cell[1] === y)) {
            return false;
        }

        this.validAttack.push([x, y]);

        if (this.board[x][y] === null) {
            return this.board[x][y] = 'failed';
        } else {
            this.board[x][y].hit();

            if (this.board[x][y].isSunk()) {
                this.ships --;
            }

            if (this.ships === 0) {
                this.endGame = true;
            }

            return true;
        }
    }

    autoAttack() {
        let attack = false;
        let x = 0;
        let y = 0;

        while (attack === false) {
            if (this.queue.length > 0) {
                x = this.queue[0][0];
                y = this.queue[0][1];
    
                this.queue.shift();
            } else {
                x = Math.floor(Math.random() * 10);
                y = Math.floor(Math.random() * 10);
            }

            attack = this.receiveAttack(x, y);
        }

        if (attack === true) {
            const arr = [];

            const offsets = [[-1, 0], [0, -1], [1, 0], [0, 1]];

            for (let [offsetX, offsetY] of offsets) {
                const newX = x + offsetX;
                const newY = y + offsetY;
            
                if (
                    newX >= 0 &&
                    newX < this.board.length &&
                    newY >= 0 &&
                    newY < this.board[0].length
                ) {
                    arr.push([newX, newY]);
                }
            }
            
            this.queue = [...this.queue, ...arr];
        };

        return { attack, coords: [x, y] };
    }
}

class Interaction {
    constructor() {
        this.player = new Gameboard();
        this.enemy = new Gameboard();
        this.turn = false;
        this.hitsEnemy = [];
        this.length = 0;
        this.sense = [];
        this.dragging = false;
        this.timer = null;
    }
}

export { Ship, Gameboard, Interaction };