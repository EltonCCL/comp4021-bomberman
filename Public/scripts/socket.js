const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;
    // This function gets the socket from the module
    const getSocket = function () {
        return socket;
    };
    // This function connects the server and initializes the socket
    const connect = function () {
        socket = io();
        // Wait for the socket to connect successfully

    };

    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };
    // This function sends a post message event to the server
    const postMessage = function (content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    const test = function (content) {
        socket.emit("test", "testing");
    }
    return { getSocket, connect, disconnect, postMessage, test };
})();
