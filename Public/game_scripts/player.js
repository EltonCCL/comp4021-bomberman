// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function (ctx, x, y, gameArea, mapArea, id) {
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft: { x: 0, y: 98, width: 32, height: 25, count: 1, timing: 2000, loop: false },
        idleUp: { x: 0, y: 3, width: 32, height: 25, count: 1, timing: 2000, loop: false },
        idleRight: { x: 0, y: 35, width: 32, height: 25, count: 1, timing: 2000, loop: false },
        idleDown: { x: 0, y: 65, width: 32, height: 25, count: 1, timing: 2000, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft: { x: 0, y: 98, width: 32, height: 25, count: 7, timing: 50, loop: true },
        moveUp: { x: 0, y: 3, width: 32, height: 25, count: 7, timing: 50, loop: true },
        moveRight: { x: 0, y: 35, width: 32, height: 25, count: 7, timing: 50, loop: true },
        moveDown: { x: 0, y: 65, width: 32, height: 25, count: 7, timing: 50, loop: true }
    };

    // player base stat
    let stat = {
        numBombs: 1,
        range: 1,
        life: 1
    }

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);
    const playerScale = 1.6;

    // Used to define the point for object collision
    const BoxW = 13;
    const BoxH = 15;
    let PID = id;

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.idleDown)
        .setScale(playerScale)
        .setShadowScale({ x: 0.6, y: 0.20 })
        .useSheet("assets/bomberman_sprites.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // x, y position of the player
    let xPos = x;
    let yPos = y;

    // i, j grid of the player
    let iIndex = Math.floor(y / 50);
    let jIndex = Math.floor(x / 50);

    // This is the moving speed (pixels per second) of the player
    let speed = 100;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function (dir) {
        if (dir >= 1 && dir <= 4 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
        }
    };

    // This function stops the player from moving.
    // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function (dir) {
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.idleLeft); break;
                case 2: sprite.setSequence(sequences.idleUp); break;
                case 3: sprite.setSequence(sequences.idleRight); break;
                case 4: sprite.setSequence(sequences.idleDown); break;
            }
            direction = 0;
        }
    };

    // This function speeds up the player.
    const speedUp = function () {
        oriSpeed = speed;
        speed = 500;
        stat.numBombs = 10;
        stat.life = 999;
        stat.range = 10;
    };

    // This function slows down the player.
    const slowDown = function () {
        speed = 100;
        stat.numBombs = 1;
        stat.life = 1;
        stat.range = 1;
    };

    // get player 4 cornor coordinate
    function updateBound(x, y) {
        x1 = x - BoxW;
        y1 = y - BoxH;
        x2 = x + BoxW;
        y2 = y + BoxH;
    };

    function getGridIndex(x, y) {
        return [Math.floor(x / 50), Math.floor(y / 50)];
    }

    // update stat with repective with buff
    function updateStat(buff) {
        switch (buff) {
            case "speedBoost":
                speed = speed + 10;
                break;
            case "extraRange":
                stat.range++;
                break;
            case "extraLife":
                stat.life++;
                break;
            case "extraBomb":
                stat.numBombs++;
                break;
        }
    }

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function (time) {
        /* Update the player if the player is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();
            let { x0, y0 } = sprite.getXY();
            x0 = x;
            y0 = y;
            /* Move the player */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }

            /* Set the new position if it is within the game area */
            xPos = x;
            yPos = y;
            iIndex = Math.floor(y / 50);
            jIndex = Math.floor(x / 50);

            buff = mapArea.haveBuff(iIndex, jIndex)
            if (buff) {
                updateStat(buff);
                // console.log(buff);
            }
            updateBound(xPos, yPos);

            if (gameArea.isPointInBox(x, y)) {

                // Ignore some grid during collosion
                // This is used to prevent the player get stuck by the bomb he just placed
                ignoreBlock = [[Math.floor((x0 - BoxW) / 50), Math.floor((y0 - BoxH) / 50)],
                [Math.floor((x0 - BoxW) / 50), Math.floor((y0 + BoxH) / 50)],
                [Math.floor((x0 + BoxW) / 50), Math.floor((y0 - BoxH) / 50)],
                [Math.floor((x0 + BoxW) / 50), Math.floor((y0 + BoxH) / 50)],
                [Math.floor((x0) / 50), Math.floor((y0 - BoxH) / 50)],
                [Math.floor((x0) / 50), Math.floor((y0 + BoxH) / 50)],
                [Math.floor((x0 - BoxW) / 50), Math.floor((y0) / 50)],
                [Math.floor((x0 + BoxW) / 50), Math.floor((y0) / 50)]];

                // check collisin
                if (!(mapArea.isCollision(xPos - BoxW, yPos - BoxH, ignoreBlock) ||
                    mapArea.isCollision(xPos - BoxW, yPos + BoxH, ignoreBlock) ||
                    mapArea.isCollision(xPos + BoxW, yPos - BoxH, ignoreBlock) ||
                    mapArea.isCollision(xPos + BoxW, yPos + BoxH, ignoreBlock))) {
                    sprite.setXY(x, y);
                }
            }
        }

        /* Update the sprite object */
        sprite.update(time);
        // console.log("Update player");
    };

    const getIJ = function () {
        return { i: iIndex, j: jIndex };
    }

    const getPlayerSize = function () {
        return { w: 32 * playerScale, h: 25 * playerScale };
    }

    const placeBomb = function (bombs) {
        bombs.placeBomb(iIndex, jIndex, this);
    }

    // call when hit
    const reduceLife = function (playerID) {

        stat.life--;
        if (stat.life <= 0) {
            // prevent calling anything again after the game is ended
            if ($("#waitingText").text().includes("win"))
                return;
            // playerName = enemy
            // Since this function is called by the damaged player, the enemy of that player must be winning this game
            // Since the game is designed for single player, this approach is a bit weird
            var playerName = (playerID == 2) ? $("#join-player1").text() : $("#join-player2").text();
            // only the winner send the end game event to server since the name will display on screen
            if (Authentication.getUser().username == playerName)
                Socket.endGame(playerName);
            stat.life = 0;
            speed = 0;
            console.log(playerName, "is dead");
        }
    }
    // The methods are returned as an object here.
    return {
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update,
        getPlayerSize: getPlayerSize,
        placeBomb: placeBomb,
        stat: stat,
        PID: PID,
        getIJ, getIJ,
        reduceLife: reduceLife
    };
};
