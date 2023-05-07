const game = (function () {

    $("#game-canvas").css('opacity', '0.1');
    const players = [];
    let bombs = null;
    let playerID = null;
    let allowMove = true;

    const start = function () {

        /*Initialize the size of the map (canvas)*/
        selectedMap = map_1;

        let ctx_game = $("#game-canvas").get(0);
        ctx_game.width = selectedMap[0].length * 50;
        ctx_game.height = selectedMap.length * 50;
        ctx_game.style.display = "inline";
        const gameContext = ctx_game.getContext("2d");

        let gameStartTime = 0;

        const mapArea = Maps(gameContext, selectedMap);
        const gameArea = BoundingBox(gameContext, 0, 0, ctx_game.height, ctx_game.width);

        players[0] = Player(gameContext, 75, 75, gameArea, mapArea, 1);
        players[1] = Player(gameContext, ctx_game.width - 75, ctx_game.height - 75, gameArea, mapArea, 2);

        bombs = Bombs(mapArea, players);

        // Initializing the player board
        for (let k = 0; k < players.length; k++) {
            $("#playerBorad").append("<div id=p" + k + "><span class=\"name\">Player " + (k + 1) + "<div>Life: <span class=\"life\"></span><div>Number of Bombs: <span class=\"bombs\"></span><div>Bomb Range: <span class=\"bombRange\"></span></div></span></div>");
        }
        for (let k = 0; k < players.length; k++) {
            $("#p" + k + " .life").html(players[k].stat.life);
        }
        for (let k = 0; k < players.length; k++) {
            $("#p" + k + " .bombs").html(players[k].stat.numBombs);
        }
        for (let k = 0; k < players.length; k++) {
            $("#p" + k + " .bombRange").html(players[k].stat.range);
        }


        function doFrame(now) {
            if (gameStartTime == 0) gameStartTime = now;
            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;

            /* Update the sprites */
            mapArea.update(now);
            for (let p = 0; p < players.length; p++) {
                players[p].update(now);
            }

            /* Clear the screen */
            gameContext.clearRect(0, 0, ctx_game.width, ctx_game.height);

            /* Draw the sprites */
            mapArea.draw();
            for (let p = 0; p < players.length; p++) {
                players[p].draw(now);
            }

            // Used to draw the line on the canvas
            gameContext.beginPath();
            let p = 0;
            while (p < ctx_game.height) {
                gameContext.moveTo(0, 50 + p);
                gameContext.lineTo(ctx_game.width, 50 + p)
                p = p + 50;
            }
            p = 0;
            while (p < ctx_game.width) {
                gameContext.moveTo(0 + p, 0);
                gameContext.lineTo(0 + p, ctx_game.height)
                p = p + 50;
            }
            gameContext.stroke();

            // Update player board - can remove when we have backend
            for (let k = 0; k < players.length; k++) {
                $("#p" + k + " .life").html(players[k].stat.life);
            }
            for (let k = 0; k < players.length; k++) {
                $("#p" + k + " .bombs").html(players[k].stat.numBombs);
            }
            for (let k = 0; k < players.length; k++) {
                $("#p" + k + " .bombRange").html(players[k].stat.range);
            }

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }
        // Handle player movement
        $(document).on("keydown", function (event) {
            setTimeout(function () {
                switch (event.keyCode) {
                    case 32:
                        Socket.postMovement("speedUp", 0);
                        $("#playerBorad").css("color", "red");
                        break;
                    case 37:
                        Socket.postMovement("move", 1);
                        break;
                    case 38:
                        Socket.postMovement("move", 2);
                        break;
                    case 39:
                        Socket.postMovement("move", 3);
                        break;
                    case 40:
                        Socket.postMovement("move", 4);
                        break;
                    case 77:
                        Socket.postMovement("bomb", 0);
                        break;
                }
            }, 20);
        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function (event) {
            setTimeout(function () {
                switch (event.keyCode) {
                    case 32:
                        Socket.postMovement("slowDown", 0);
                        $("#playerBorad").css("color", "white");
                        break;
                    case 37:
                        Socket.postMovement("stop", 1);
                        break;
                    case 38:
                        Socket.postMovement("stop", 2);
                        break;
                    case 39:
                        Socket.postMovement("stop", 3);
                        break;
                    case 40:
                        Socket.postMovement("stop", 4);
                        break;
                }
            }, 20);
        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }


    //will be called when socket.on("move")
    const move = function (playerID, movement, direction) {
        if (movement == "move")
            players[playerID].move(direction);

        if (movement == "stop")
            players[playerID].stop(direction);

        if (movement == "bomb")
            bombs.placeBomb(players[playerID], direction);

        if (movement == "speedUp")
            players[playerID].speedUp();

        if (movement == "slowDown")
            players[playerID].slowDown();
    }




    return { start, move };
})();



