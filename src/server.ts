import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const players: any = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  const playerId = socket.id;

  players[playerId] = {
    x: Math.random() * 800,
    y: Math.random() * 600,
  };

  socket.emit("init", { playerId, players });

  socket.broadcast.emit("playerConnected", playerId, players[playerId]);

  socket.on("move", (data) => {
    players[playerId].x = data.x;
    players[playerId].y = data.y;
    socket.broadcast.emit("playerMoved", { playerId, x: data.x, y: data.y });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete players[playerId];
    io.emit("playerDisconnected", playerId);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
