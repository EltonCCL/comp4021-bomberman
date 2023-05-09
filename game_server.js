const express = require("express");
const speed = 200;
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("Public/data/users.json"));
    //
    // E. Checking for the user data correctness
    //
    if (!username || !avatar || !name || !password) {
        res.json({
            status: "error",
            error: "Username/avatar/name/password cannot be empty."
        });
        return;
    }
    if (!containWordCharsOnly(username)) {
        res.json({
            status: "error",
            error: "Username can only contain underscores, letters or numbers."
        });
        return;
    }
    if (username in users) {
        res.json({
            status: "error",
            error: "Username has already been used."
        });
        return;
    }
    const hash = bcrypt.hashSync(password, 10);
    //
    // G. Adding the new user account
    //
    users[username] = { avatar, name, password: hash };
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("Public/data/users.json", JSON.stringify(users, null, " "));
    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });

});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("Public/data/users.json"));
    //
    // E. Checking for username/password

    //
    if (username in users) {
        if (!bcrypt.compareSync(password, users[username].password)) {
            res.json({
                status: "error",
                error: "Incorrect username/password."
            });
            return;
        }
    }
    else {
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    //
    // G. Sending a success response with the user account
    //
    req.session.user = { username, avatar: users[username].avatar, name: users[username].name };
    res.json({ status: "success", user: { username, avatar: users[username].avatar, name: users[username].name } });



});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    if (!req.session.user) {
        res.json({
            status: "error",
            error: "You have not signed in."
        });
        return;
    }

    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success", user: req.session.user });


});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    req.session.destroy();

    //
    // Sending a success response
    //
    res.json({ status: "success" });


});

const waitUntil = (condition, checkInterval = 1) => {
    return new Promise(resolve => {
        let interval = setInterval(() => {
            if (!condition()) return;
            clearInterval(interval);
            resolve();
        }, checkInterval)
    })
}

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
const onlineUsers = {};
let players = { player1: null, player2: null };
let gameEnded = false;
let nextFrame = { player1: false, player2: false };
let p1Data = null;
let p2Data = null;
let map = null;
let playerDir = [0,0];
let flag = false;
io.on("connection", (socket) => {
    if (socket.request.session.user) {
        const { username, avatar, name } = socket.request.session.user;
        onlineUsers[username] = { avatar, name };
        // console.log("con", onlineUsers, players);
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }
    socket.on("disconnect", () => {
        if (socket.request.session.user) {
            const { username } = socket.request.session.user;
            if (onlineUsers[username]) delete onlineUsers[username];
            // console.log(onlineUsers);
            io.emit("remove user", JSON.stringify(socket.request.session.user));
        }
        players["player1"] = null;
        players["player2"] = null;
        gameEnded = false;

        // console.log("dis", onlineUsers, players);
    })
    socket.on("get users", () => {
        socket.emit("users", JSON.stringify(onlineUsers));
        // console.log("get", onlineUsers, players);
    });

    //broadcast the movement to all players
    socket.on("move", (data) => {
        setTimeout(function () {
            //handle place bomb movement
            if (data.movement == "bomb") {
                // generate random nubmer from 0 - 2
                let randomNumber = Math.floor(Math.random() * 3);
                //use direction as the random index of the random dropped item
                io.emit("move", { playerID: data.playerID, movement: data.movement, direction: randomNumber });
            }
            //handle move & cheat movement
            else {
                if (data.movement == "move"){
                    playerDir[data.playerID] = data.direction;
                }
                if (data.movement == "stop"){
                    playerDir[data.playerID] = 0;
                }
                
                io.emit("move", { playerID: data.playerID, movement: data.movement, direction: data.direction });
                // console.log({ playerID: data.playerID, movement: data.movement, direction: data.direction });
            }
        }, 10);
    });

    //broadcast the join game event to all players
    socket.on("join game", (data) => {
        if (data.playerID == 0) {
            players["player1"] = data.playerName;
        }
        else if (data.playerID == 1) {
            players["player2"] = data.playerName;
        }
        io.emit("join game", { playerName: data.playerName, playerID: data.playerID });
        if (players["player1"] !== null && players["player2"] !== null) {
            // console.log("Enough player, start now, initializing player pos");

            // initPos()
        }
        // console.log("joi", onlineUsers, players);
    });

    //broadcast end game event to all players
    socket.on("end game", (data) => {
        // console.log("clearing player pos");

        if (!gameEnded) {
            //update leaderboard
            let content = JSON.parse(fs.readFileSync("public/data/leaderboard.json"));
            let playerName = data;
            //existing player
            if (content[playerName])
                content[playerName] += 1;
            //new player
            else {
                content[playerName] = 1;
            }
            fs.writeFileSync("public/data/leaderboard.json", JSON.stringify(content));
            io.emit("end game", data);
            players["player1"] = null;
            players["player2"] = null;
            gameEnded = true;
        }
    });

    //broadcast restart game event to all players
    socket.on("restart", () => {
        gameEnded = false;
        io.emit("restart", true);
    });

    socket.on("get leaderboard", () => {
        let content = JSON.parse(fs.readFileSync("public/data/leaderboard.json"));
        socket.emit("get leaderboard", content);
    });

    socket.on("get currentPlayer", () => {
        io.emit("get currentPlayer", players);
    });

    socket.on("is Collision", (data) =>{
        // flag = true;
        // console.log(data);
        if (data[0] == [0]){
            let p1 = {x:p1Pos.x, y:p1Pos.y};
            let p2 = {x:p2Pos.x, y:p2Pos.y};
            if (data[1]){
                // console.log("collision");
                // io.emit("next frame", [p1Pos, p2Pos]);

            }else{
                p1x = p1Pos.x;
                p1y = p1Pos.y;

                switch (playerDir[0]) {
                            case 1: p1x -= speed / 60; break;
                            case 2: p1y -= speed / 60; break;
                            case 3: p1x += speed / 60; break;
                            case 4: p1y += speed / 60; break;
                        }
                // io.emit("next frame", [{x:x, y:y}, p2Pos]);
                p1 = {x:p1x, y:p1y};
            }

            if (data[2]){

            }else{
                p2x = p2Pos.x;
                p2y = p2Pos.y;

                switch (playerDir[1]) {
                            case 1: p2x -= speed / 60; break;
                            case 2: p2y -= speed / 60; break;
                            case 3: p2x += speed / 60; break;
                            case 4: p2y += speed / 60; break;
                        }
                p2 = {x:p2x, y:p2y};
                // io.emit("next frame", [{x:x, y:y}, p2Pos]);
            }

           io.emit("next frame", [p1, p2]);
        }
    });

    // data = [ playerID, p1X cor, p1Y cor, p2X cor, p2Y cor ]
    socket.on("next frame", (data) => {
        // map = data[3];
        // console.log(map);
        // console.log(data[1]);
        // console.log(data);
        if (data[0] == 0) {
            nextFrame.player1 = true;
            p1Data = data[1];
            p2Data = data[2];
            // console.log(p1Data);
        } else {
            nextFrame.player2 = true;

        }
        // console.log(data, "request frame");
        if (nextFrame.player1 == true && nextFrame.player2 == true) {
            
            nextFrame.player1 = false;
            nextFrame.player2 = false;
            p1Pos = p1Data;
            p2Pos = p2Data;
            // console.log("request frame");
            io.emit("checkColli", [[0,p1Pos,playerDir[0]],[1,p2Pos,playerDir[1]]]);

            // io.emit("next frame", [p1Pos, p2Pos]);

        }

    })

});

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

httpServer.listen(8000, () => {
    console.log("The game server has started...");
});