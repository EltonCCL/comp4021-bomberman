const game = (function () {

    const start = function () {

        Socket.test();

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

        const players = [];
        players[0] = Player(gameContext, 75, 75, gameArea, mapArea, 1);
        players[1] = Player(gameContext, ctx_game.width - 75, ctx_game.height - 75, gameArea, mapArea, 2);

        const bombs = Bombs(mapArea, players);

        // Initializing the player board
        for (let k = 0; k < players.length; k++) {
            $("#playerBorad").append("<div id=p" + k + "><span class=\"name\">Player " + (k + 1) + "<div>Life: <span class=\"life\"></span></div></span></div>");
        }
        for (let k = 0; k < players.length; k++) {
            $("#p" + k + " .life").html(players[k].stat.life);
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

            /* Process the next frame */
            requestAnimationFrame(doFrame);
        }
        // Handle player movement
        $(document).on("keydown", function (event) {
            switch (event.keyCode) {
                case 32:
                    players[0].speedUp();
                    break;
                case 37:
                    players[0].move(1);
                    break;
                case 38:
                    players[0].move(2);
                    break;
                case 39:
                    players[0].move(3);
                    break;
                case 40:
                    players[0].move(4);
                    break;
                case 77:
                    bombs.placeBomb(players[0]);
                    break;
            }

            switch (event.keyCode) {
                case 32:
                    players[1].speedUp();
                    break;
                case 65:
                    players[1].move(1);
                    break;
                case 87:
                    players[1].move(2);
                    break;
                case 68:
                    players[1].move(3);
                    break;
                case 83:
                    players[1].move(4);
                    break;
                case 66:
                    bombs.placeBomb(players[1]);
                    break;
            }

        });

        /* Handle the keyup of arrow keys and spacebar */
        $(document).on("keyup", function (event) {
            switch (event.keyCode) {
                case 32:
                    players[0].slowDown();
                    break;
                case 37:
                    players[0].stop(1);
                    break;
                case 38:
                    players[0].stop(2);
                    break;
                case 39:
                    players[0].stop(3);
                    break;
                case 40:
                    players[0].stop(4);
                    break;
            }
            switch (event.keyCode) {
                case 32:
                    players[1].slowDown();
                    break;
                case 65:
                    players[1].stop(1);
                    break;
                case 87:
                    players[1].stop(2);
                    break;
                case 68:
                    players[1].stop(3);
                    break;
                case 83:
                    players[1].stop(4);
                    break;
            }

        });

        /* Start the game */
        requestAnimationFrame(doFrame);
    }

    return { start };
})();



