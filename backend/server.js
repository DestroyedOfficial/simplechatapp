const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const messages = [];

io.on('connection', (socket) => {
  console.log('Új felhasználó csatlakozott');
  
  socket.emit('previous-messages', messages);

  socket.on('send-message', (message) => {
    messages.push(message);
    io.emit('new-message', message);
  });

  socket.on('disconnect', () => {
    console.log('Felhasználó kilépett');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Szerver fut a következő porton: ${PORT}`);
});