const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const Filter = require("bad-words");
const {
  generateTextMessage,
  generateLocationMessage,
  generateAccessMessage,
} = require("./utils/messages");

const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.PROD_CLIENT_URL : ["http://localhost:3000"],
  },
});

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", (username, room, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback({ error });
    }

    socket.join(user.room);

    socket.emit("message", generateTextMessage("Welcome", "Admin"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateAccessMessage(`${username} has joined`, username)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback({ user });
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity not allowed");
    }

    const user = getUser(socket.id);

    io.to(user.room).emit(
      "message",
      generateTextMessage(message, user.username)
    );
    callback();
  });

  socket.on("sendLocation", (latitude, longitude, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "message",
      generateLocationMessage(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        user.username
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateAccessMessage(`${user.username} has left`, user.username)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log("Serving on port " + port);
});
