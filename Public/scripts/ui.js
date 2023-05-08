const StartPage = (function() {
    const initialize = function() {
        show();
        $("#login").on("click", () => {
            // go to login page
            hide();
            LoginPage.show();
        });
        $("#instructions").on("click", () => {
            // go to instructions page
            hide();
            InstructionPage.show();
        });
    };
    const show = function() {
        $("#start-page").show();
        console.log('showing start page.');
    }
    const hide = function() {
        $("#start-page").hide();
        console.log('hiding start page.');
    }
    return { initialize, show, hide };
})();

const InstructionPage = (function() {
    const initialize = function() {
        $("#instruction-home").click(() => {
            // back to start page
            hide();
            StartPage.show();
        });

        // console.log($("#instruction-home"));
        hide(); // hide after initializing
    };

    const show = function() {
        $("#instruction-page").show();
        console.log('showing instruction page.');
    }
    const hide = function() {
        $("#instruction-page").hide();
        console.log('hiding instruction page.');
    }
    return { initialize, show, hide };
})();

const LobbyPage = (function() {
    const initialize = function() {

        const player1Join = $("#join-player1");
        player1Join.click(() => {
            // * add to wait queue of the game
            var playerName = Authentication.getUser().username;
            console.log(`${playerName} is ready to play`);
            // TODO: Make the server pair player automatically
            // the join Game function should take playerName as parameter only
            Socket.joinGame(playerName, 0);
            // player1Join.css('background-color', '#9c7d0a');
            // player1Join.text('Waiting Player 2 to join');
            // player1Join.prop('disabled', true);
        });

        const player2Join = $("#join-player2");
        player2Join.click(() => {
            // * add to wait queue of the game
            var playerName = Authentication.getUser().username;
            console.log(`${playerName} is ready to play`);
            Socket.joinGame(playerName, 1);
            // player2Join.css('background-color', '#9c7d0a');
            // player2Join.text('Waiting player 1 to join');
            // player2Join.prop('disabled', true);
        });



        hide();
    }
    const show = function() {
        $("#lobby-page").show();
        console.log('showing lobby page.');
    }
    const hide = function() {
        $("#lobby-page").hide();
        console.log('hiding lobby page.');
    }
    return { initialize, show, hide };
})();

const GamePage = (function() {
    const initialize = function() {
        $("#back-to-home").click(function() {
            hide();
            // LobbyPage.show();
            Socket.restartGame();

            // TODO: check if both the ready button is reset to the initial status
        });
        // // simple restart button to refresh the page
        // $("#restart").on("click", () => {
        //     Socket.restartGame();
        // });
        hide();
    }
    const show = function() {
        console.log('showing game page.');
        sounds.gameplay.loop = true;
        sounds.gameplay.play();
        $("#game-page").show();
    }
    const showEndGame = function(isWinner, placedBombs, destroyedWalls, kills,
        pointsScored, newRanking) {
        console.log('showing end game window.');
        sounds.gameplay.pause();
        $("#game-end-screen").show();
    }
    const hideEndGame = function() {
        console.log('hiding end game window.');
        $("#game-end-screen").hide();
    }
    const hide = function() {
        console.log('hiding lobby page.');
        hideEndGame();
        $("#game-page").hide();
    }
    return { initialize, show, hide, showEndGame };
})();

const LoginPage = (function() {

    const initialize = function() {
        // Hide it
        hide();

        // Submit event for the signin form
        $("#login-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    let user = Authentication.getUser();

                    Socket.connect();
                    Socket.getLeaderboard();
                    Socket.getCurrentPlayer();
                    LobbyPage.show();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#reg-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#reg-username").val().trim();
            const avatar = "&#128057;" // hard code any is fine here
            const name = "name"; // also hard coding
            const password = $("#reg-password").val().trim();
            const confirmPassword = $("#confirm-password").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#reg-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };


    const show = function() {
        $("#login-page").show();
    }
    const hide = function() {
        $("#login-page").hide();
    }
    return { initialize, show, hide };
})();


const UI = (function() {

    // The components of the UI are put here
    const components = [StartPage, InstructionPage, GamePage, LoginPage, LobbyPage];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }

        // StartPage.hide();
        // GamePage.showEndGame();
    };


    const startGame = function() {
        LobbyPage.hide();
        GamePage.show();
    }
    const endGame = function(isWinner, placedBombs, destroyedWalls, kills, pointsScored, newRanking) {
        GamePage.showEndGame(isWinner, placedBombs, destroyedWalls, kills, pointsScored, newRanking);
    }

    return { initialize, startGame, endGame };
})();