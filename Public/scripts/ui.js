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
        $("#ready").click(() => {
            // * add to wait queue of the game
            var playerName = Authentication.getUser().username;
            console.log(`${playerName} is ready to play`);
            // TODO: Make the server pair player automatically
            // the join Game function should take playerName as parameter only
            Socket.joinGame(playerName, 0);
            $("#ready").css('background-color', '#9c7d0a');
            $("#ready").text('Waiting');
        });

        $("#lobby-page").on("load", () => {
            // load player ranking
            const rankingTable = $("#players-ranking-table");

            // load online players
            const onlinePlayersTable = $("#online-players-table");
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
        hide();
    }
    const show = function() {
        console.log('showing game page.');
        $("#game-page").show();
    }
    const showEndGame = function() {
        console.log('showing end game window.');
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
                    // $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
                    // $("#user-panel .user-name").text(user.name);
                    // $("#signout-button").on("click", () => {
                    //     Authentication.signout(
                    //         () => {
                    //             Socket.disconnect();

                    //             hide();
                    //             SignInForm.show();
                    //         }
                    //     );
                    // });

                    Socket.connect();
                    // game.start();
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

        // // * where Player 1 joins the game
        // $("#join-player1").on("click", () => {
        //     var playerName = Authentication.getUser().username;
        //     Socket.joinGame(playerName, 0);
        // });

        // // * where Player 2 joins the game
        // $("#join-player2").on("click", () => {
        //     var playerName = Authentication.getUser().username;
        //     Socket.joinGame(playerName, 1);
        // });

        // // simple restart button to refresh the page
        // $("#restart").on("click", () => {
        //     Socket.restartGame();
        // })
    };


    const show = function() {
        $("#login-page").show();
    }
    const hide = function() {
        $("#login-page").hide();
    }
    return { initialize, show, hide };
})();
/*
const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
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
                    $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
                    $("#user-panel .user-name").text(user.name);
                    $("#signout-button").on("click", () => {
                        Authentication.signout(
                            () => {
                                Socket.disconnect();

                                hide();
                                SignInForm.show();
                            }
                        );
                    });

                    Socket.connect();
                    game.start();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar = $("#register-avatar").val();
            const name = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });

        // * where Player 1 joins the game
        $("#join-player1").on("click", () => {
            var playerName = Authentication.getUser().username;
            Socket.joinGame(playerName, 0);
        });

        // * where Player 2 joins the game
        $("#join-player2").on("click", () => {
            var playerName = Authentication.getUser().username;
            Socket.joinGame(playerName, 1);
        });

        // simple restart button to refresh the page
        $("#restart").on("click", () => {
            Socket.restartGame();
        })
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();
*/




const UI = (function() {

    // The components of the UI are put here
    const components = [StartPage, InstructionPage, GamePage, LoginPage, LobbyPage];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();