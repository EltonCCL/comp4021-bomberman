const express = require("express");

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


//
// ***** Please insert your Lab 6 code here *****
//
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
const onlineUsers = {};
io.on("connection", (socket) => {
    if (socket.request.session.user) {
        const { username, avatar, name } = socket.request.session.user;
        onlineUsers[username] = { avatar, name };
        //console.log(onlineUsers);
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }
    socket.on("disconnect", () => {
        if (socket.request.session.user) {
            const { username } = socket.request.session.user;
            if (onlineUsers[username]) delete onlineUsers[username];
            //console.log(onlineUsers);
            io.emit("remove user", JSON.stringify(socket.request.session.user));
        }
    })
    socket.on("get users", () => {
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    //broadcast the movement to all players
    socket.on("move", (data) => {
        //handle place bomb movement
        if (data.movement == "bomb") {
            // generate random nubmer from 0 - 3
            let randomNumber = Math.floor(Math.random() * 4);
            //use direction as the random index of the random dropped item
            io.emit("move", { playerID: data.playerID, movement: data.movement, direction: randomNumber });
        }
        //handle move & cheat movement
        else
            io.emit("move", { playerID: data.playerID, movement: data.movement, direction: data.direction });
    });

    //broadcast the join game event to all players
    socket.on("join game", (data) => {
        io.emit("join game", { playerName: data.playerName, playerID: data.playerID })
    });
});

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

httpServer.listen(8000, () => {
    console.log("The game server has started...");
});