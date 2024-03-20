import { Interaction } from './logic.js';
import './comp/style.css';
import IconRot from './comp/rotate.svg';
import ship1 from './comp/ship1.svg';
import ship2 from './comp/ship2.svg';
import ship3 from './comp/ship3.svg';
import ship4 from './comp/ship4.svg';

let init = new Interaction();

initGame();

function initGame() {
    document.body.innerHTML = `
  <header><h1>Battleship</h1></header>
  <main class="main">
      <div class="btns-container">
        <button id="random">Random</button>
        <button id="restart">Restart</button>
      </div>
      <a class=text-player>Player</a>
      <a class=text-enemy>Enemy</a>
  </main>
  <footer>By Lucas Carovano</footer>
`;

    const btnRestart = document.getElementById('restart');
    const btnRandom = document.getElementById('random');
    btnRestart.addEventListener('click', initGame);
    btnRandom.addEventListener('click', () => {
        while (init.player.shipsArr.length > 0) {
            const random = init.player.random();
            init.length = random.lon;
            init.sense = random.sense;
            const locker = document.querySelector(`.locker-player[data-coor="${JSON.stringify([random.x, random.y])}"]`);
            insertShip(locker, true);
            printBoard(locker, true, true);
        }
    });
    
    clearInterval(init.interval);
    init = new Interaction();
    loadGameboard();
}

function loadGameboard() {
    const main = document.querySelector('.main');
    const player = document.createElement('div');
    player.classList.add('player');
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    const ships = document.createElement('div');
    ships.classList.add('ships');

    for (let i = 0; i < 10; i++) {
        const ship = document.createElement('div');
        ship.classList.add('ship-h');
        ship.setAttribute('data-sense', JSON.stringify([0, 1]));
        ship.style.cursor = 'grab';
        ship.setAttribute('data-length', JSON.stringify(init.player.shipsArr[i]));

        const rotate = new Image();
        rotate.src = IconRot;
        const shipImages = {
            1: ship1,
            2: ship2,
            3: ship3,
            4: ship4,
        };
        const imgShip = new Image();
        imgShip.src = shipImages[init.player.shipsArr[i]];
        ship.appendChild(imgShip);

        if (init.player.shipsArr[i] > 1) {
            const rotDiv = document.createElement('div');
            rotDiv.classList.add('rotation-fixed');
            rotDiv.addEventListener('click', function() {
                const parentShip = this.parentNode;
    
                parentShip.classList.toggle('ship-v');
    
                let currSense = JSON.parse(parentShip.getAttribute('data-sense'));
                currSense = currSense[0] === 0 ? [1, 0] : [0, 1];
                parentShip.setAttribute('data-sense', JSON.stringify(currSense));
            });

            rotDiv.appendChild(rotate);
            ship.appendChild(rotDiv);
        }

        ship.addEventListener('mousedown', function() {
            init.dragging = true;
            init.length = JSON.parse(this.getAttribute('data-length'));
            init.sense = JSON.parse(this.getAttribute('data-sense'));
            ship.removeAttribute('style');
            document.body.style.cursor = 'grabbing';
        });

        ships.appendChild(ship);
    }

    document.body.addEventListener('mouseup', (event) => {
        document.body.removeAttribute('style');
        const shipAll = document.querySelectorAll('.ship-h');
        shipAll.forEach(ship => {
            ship.style.cursor = 'grab';
        });

        const allLockers = document.querySelectorAll('.locker-player');
        allLockers.forEach(locker => {
            if (!locker.classList.contains('is-existing')) {
                locker.innerHTML = '';
            }
        });

        if (init.dragging) {
            init.dragging = false;

            if (event.target.classList.contains('locker-player')) {
                const check = insertShip(event.target, true);
                if (check.check) {
                    printBoard(event.target, check.check, true);
                } else {
                    printBoard(event.target, check.check);
                }
            }
        }
    });

    for (let i = 0; i < 10; i++) {  
        for (let j = 0; j < 10; j++) {
            const lockerPlayer = document.createElement('div');
            lockerPlayer.classList.add('locker-player');
            lockerPlayer.setAttribute('data-coor', JSON.stringify([i, j]));

            lockerPlayer.addEventListener('mouseover', () => {
                const allLockers = document.querySelectorAll('.locker-player');
                allLockers.forEach(locker => {
                    if (!locker.classList.contains('is-existing')) {
                        locker.innerHTML = '';
                    }
                });

                if (init.dragging) {            
                    const check = insertShip(lockerPlayer);
                    printBoard(lockerPlayer, check.check);
                }  
            });

            const lockerEnemy = document.createElement('div');
            lockerEnemy.classList.add('locker-enemy');
            lockerEnemy.setAttribute('data-coor', JSON.stringify([i, j]));

            lockerEnemy.addEventListener('click', () => {
                if (init.turn) {
                    const shotPlayer = init.enemy.receiveAttack(i, j);
                    if (shotPlayer === false) {
                        return;
                    }
                    printAttack('enemy', shotPlayer, [i, j]);
                    const shotEnemy = init.player.autoAttack();
                    printAttack('player', shotEnemy.attack, shotEnemy.coords);
                    timerAttack();
                }
            }, { once: true });
    
            player.appendChild(lockerPlayer);
            enemy.appendChild(lockerEnemy);
        }
    }

    main.appendChild(player);
    main.appendChild(enemy);
    main.appendChild(ships);
}

function printBoard(thisElement, check, method) {
    const getCoor = JSON.parse(thisElement.getAttribute('data-coor'));
    for (let k = 0; k < init.length; k++) {
        const coords = JSON.parse(`[${getCoor[0] + init.sense[0] * k}, ${getCoor[1] + init.sense[1] * k}]`);
        if(coords[0] > 9 || coords[1] > 9) {
            return;
        }
        const locker = document.querySelector(`.locker-player[data-coor="${JSON.stringify(coords)}"]`);

        if(!locker.classList.contains('is-existing')) {
            let color = 3;

            if (method) {
                color = 1;
                locker.classList.add('is-existing');
            } else if (check) {
                color = 2;
            }
    
            const shipImages = {
                1: ship1,
                2: ship2,
                3: ship3,
                4: ship4,
            };
        
            const colors = {
                1: 'invert(1)',
                2: 'invert(52%) sepia(92%) saturate(2021%) hue-rotate(84deg) brightness(116%) contrast(128%)',
                3: 'invert(16%) sepia(90%) saturate(6135%) hue-rotate(358deg) brightness(111%) contrast(115%)',
            }
        
            const size = 30;
            const imgShip = new Image();
            imgShip.src = shipImages[init.length];
            imgShip.setAttribute('fill', 'red');
            imgShip.style.cssText = `
            width: ${init.length * 100}%;
            height: ${size}px;
            position: relative;
            filter: ${colors[color]};
            pointer-events: none;
            padding: 3px;
            box-sizing: border-box;`
        
            if (init.sense[0] !== 1) {
                imgShip.style.top = '0px';
                imgShip.style.left = `${0 + -k * size}px`;
            } else {
                imgShip.style.transformOrigin = '0% 0%';
                imgShip.style.transform = 'rotate(90deg)';
                imgShip.style.left = `${size}px`;
                imgShip.style.top = `${0 + -k * size}px`;
            };
        
            locker.appendChild(imgShip);
        }
    }
}

function printAttack(target, shot, coords) {
    const locker = document.querySelector(`.locker-${target}[data-coor="${JSON.stringify(coords)}"]`);
    locker.style.cursor = 'default';
    const text = document.querySelector('.text');
    locker.classList.add('is-existing');
    if (shot === 'failed') {
        locker.style.cssText = `background: red;`
        text.textContent = `Shoot missed! Your turn`;
    } else if (shot) {
        locker.style.cssText = `background: green; z-index: 0;`
        text.textContent = `Successful shoot! Your turn`;

        if (init.player.endGame === true || init.enemy.endGame === true) {
            text.textContent = 'End game';
            init.turn = false;
            const enemy = document.querySelector('.enemy');
            enemy.style.cursor = 'none';
        }
    } else {
        text.textContent = `You've already tried that coordinate`;
    }
}

function insertShip(target, method = false) {
    const coord = JSON.parse(target.getAttribute('data-coor'));
    const check = init.player.checkIns(coord[0], coord[1], init.sense[0], init.sense[1], init.length);

    if (check && method) {
        init.player.insert(coord[0], coord[1], init.sense[0], init.sense[1], init.length);
        document.querySelector(`[data-length="${init.length}"]`).remove();

        const allLocks = document.querySelectorAll('.ship-h');
        allLocks.forEach(lock => {
            lock.removeAttribute('style');
        });

        if (init.player.shipsArr.length === 0) {
            while (init.enemy.shipsArr.length > 0) {
                const random = init.enemy.random();
                init.length = random.lon;
                init.sense = random.sense;
                init.enemy.insert(random.x, random.y, init.sense[0], init.sense[1], init.length);
            }

            const startGame = document.createElement('button');
            startGame.textContent = 'Start Game';
            const btns = document.querySelector('.btns-container');
            document.getElementById('random').remove();
            document.querySelector('.ships').remove();


            const text = document.createElement('a');
            const timer = document.createElement('a');
            text.classList.add('text');
            timer.classList.add('timer');
           
            text.textContent = 'Please click the Start Game button to play.';

            const main = document.querySelector('main');

            main.appendChild(text);
            main.appendChild(timer);
            btns.appendChild(startGame);

            startGame.addEventListener('click', function() {
                text.textContent = 'Fire at an enemy grid!'
                const enemy = document.querySelector('.enemy');
                const lockerAll = enemy.querySelectorAll('.locker-enemy')

                lockerAll.forEach(locker => {
                    locker.style.cursor = 'crosshair';
                });

                
                init.turn = true;
                startGame.remove();
            });
        }
    }

    return { x: coord[0], y: coord[1], check }
}

function timerAttack() {
    const timer = document.querySelector('.timer');
    timer.textContent = '';
    clearInterval(init.interval);
    let count = 5;
    init.interval = setInterval(() => {
        if (count > 0) {
            timer.textContent = `Automatic attack in ${count}.`;
            count--;
        } else {
            const shotPlayer = init.enemy.autoAttack();
            printAttack('enemy', shotPlayer.attack, shotPlayer.coords);
            const shotEnemy = init.player.autoAttack();
            printAttack('player', shotEnemy.attack, shotEnemy.coords);
            timer.textContent = '';
            count = 5;
        }
    }, 1000);
};