const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// CORS sozlamalari - barcha manbalardan so'rovlar ruxsat etiladi
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

// Socket.io serverini yaratish
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.io hodisalari
io.on("connection", (socket) => {
  console.log(`✅ Foydalanuvchi ulandi: ${socket.id}`);

  // Xabar yuborish hodisasini tinglash
  socket.on("send_message", (data) => {
    // Xabar obyektini yaratish
    const message = {
      id: Date.now() + "-" + socket.id,
      text: data.text,
      username: data.username,
      timestamp: new Date().toISOString(),
    };

    // Xabarni BARCHA ulangan foydalanuvchilarga yuborish (yuboruvchiga ham)
    io.emit("receive_message", message);

    console.log(`💬 [${data.username}]: ${data.text}`);
  });

  // Foydalanuvchi uzilganda
  socket.on("disconnect", () => {
    console.log(`❌ Foydalanuvchi uzildi: ${socket.id}`);
  });
});

// Serverni 5000-portda ishga tushirish
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
  console.log(`📡 Socket.io tayyor...`);
});
