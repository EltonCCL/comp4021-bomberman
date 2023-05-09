const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;
    let _playerID = null;
    // This function gets the socket from the module
    const getSocket = function () {
        return socket;
    };
    // This function connects the server and initializes the socket
    const connect = function () {
        socket = io();
        // Wait for the socket to connect successfully

        // Set up the movement event
        socket.on("move", (data) => {
            console.log(data.playerID, data.movement, data.direction);
            setTimeout(function () {
                game.move(data.playerID, data.movement, data.direction);
            }, 10);
        });


        // Set up the join game event
        socket.on("join game", (data) => {
            //left join button
            if (data.playerID == 0) {
                $("#join-player1").html(data.playerName);
                $("#join-player1").css("background", "blue");
            }
            //right join button
            if (data.playerID == 1) {
                $("#join-player2").html(data.playerName);
                $("#join-player2").css("background", "blue");
            }

            //when left & right buttons are pressed by player, the game start
            if ($("#join-player1").html() != "Player 1" && $("#join-player2").html() != "Player 2") {
                $("#game-canvas").css('opacity', '1');
                $("#waitingText").html("Game Start!");
                UI.startGame();
                game.start();
            }
        });

        socket.on("end game", (winner) => {
            $("#game-canvas").css('opacity', '0.1');
            $("#is-winner").html(winner + " win the game!");
            // disable all onclick listener
            $(document).unbind();
            getLeaderboard();
            // // CLONE leaderboard
            // $("#score-board").clone().prependTo("#end-game-ranking");
            // Load leaderboard again instead of cloning
            socket.on("get leaderboard", (leaderboard) => {
                var leaderboardArray = Object.entries(leaderboard);
                // sorting ranks
                leaderboardArray.sort(function (a, b) {
                    return b[1] - a[1];
                });

                // use getElement to get object instead of jquery
                var tableBody = document.getElementById("end-game-table-body");

                // loop & get all data
                leaderboardArray.forEach(function (data, index) {
                    var row = tableBody.insertRow(); // Create a new row
                    // Create cells and populate with data
                    var rankingCell = row.insertCell();
                    rankingCell.textContent = index + 1;
                    var nameCell = row.insertCell();
                    nameCell.textContent = data[0];
                    var scoreCell = row.insertCell();
                    scoreCell.textContent = data[1];
                });
            });
            $("#playerBorad").clone().prependTo("#game-stat-text");
            $("#game-stat-text").css("color", "white");
            UI.endGame(); // TODO: pass in arguments for showing the game stat after end game
        });

        socket.on("restart", () => {
            location.reload();
        });

        // TODO : create a leaderboard with below data
        socket.on("get leaderboard", (leaderboard) => {
            var leaderboardArray = Object.entries(leaderboard);
            // sorting ranks
            leaderboardArray.sort(function (a, b) {
                return b[1] - a[1];
            });

            // use getElement to get object instead of jquery
            var tableBody = document.getElementById("table-body");

            // loop & get all data
            leaderboardArray.forEach(function (data, index) {
                var row = tableBody.insertRow(); // Create a new row
                // Create cells and populate with data
                var rankingCell = row.insertCell();
                rankingCell.textContent = index + 1;
                var nameCell = row.insertCell();
                nameCell.textContent = data[0];
                var scoreCell = row.insertCell();
                scoreCell.textContent = data[1];
            });
        });

        socket.on("get currentPlayer", (players) => {
            if (players["player1"] != null) {
                $("#join-player1").html(players["player1"]);
                $("#join-player1").css("background", "blue");
            }
            if (players["player2"] != null) {
                $("#join-player2").html(players["player2"]);
                $("#join-player2").css("background", "blue");
            }
        });

        socket.on("next frame", (data) => {
            // console.log("Received", isReady);
            game.nextFrame(data);
            // if (isReady){
            //     game.nextFrame();
            // }
        });
        socket.on("checkColli", (data) => {
            // console.log(data);
            player = data[0]
            pos = data[1];
            dir = data[2];
            
            game.checkCollision(player,pos, dir);
        });

    };

    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };

    // post movement to server (called by game.js)
    const postMovement = function (movement, direction) {
        setTimeout(function () {
            socket.emit("move", { playerID: _playerID, movement: movement, direction: direction });
        }, 10);
    }

    // post player data to server (called by ui.js)
    const joinGame = function (playerName, playerID) {
        _playerID = playerID
        socket.emit("join game", { playerName: playerName, playerID: playerID });
    }

    // post the winner player name to server
    const endGame = function (playerName) {
        socket.emit("end game", playerName);
    }

    const restartGame = function () {
        socket.emit("restart", true);
    }

    // get all players rank
    const getLeaderboard = function () {
        socket.emit("get leaderboard", true);
    }

    const getCurrentPlayer = function () {
        socket.emit("get currentPlayer", true);
    }
    const requestFrame = function(p1, p2){
        // console.log(p1);
        socket.emit("next frame", [_playerID, p1.getXY(),p2.getXY()]);
        
    }
    const isCollide = function(isCol){
        console.log("emit collid");
        socket.emit("is Collision", [_playerID,isCol]);
    }

    return { getSocket, connect, disconnect, postMessage, postMovement, joinGame, endGame, restartGame, getLeaderboard, getCurrentPlayer ,requestFrame, isCollide};
})();