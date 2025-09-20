const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = [];

io.on('connection', (socket) => {
  console.log('بازیکن وصل شد:', socket.id);
  players.push(socket);

  if (players.length === 2) {
    players[0].emit('start', 'منتظر انتخاب شما هستیم...');
    players[1].emit('start', 'منتظر انتخاب شما هستیم...');
  }

  socket.on('choice', (choice) => {
    socket.choice = choice;
    if (players.every(p => p.choice)) {
      const [p1, p2] = players;
      const result = getResult(p1.choice, p2.choice);
      p1.emit('result', { you: p1.choice, opponent: p2.choice, result: result[0] });
      p2.emit('result', { you: p2.choice, opponent: p1.choice, result: result[1] });
      players.forEach(p => p.choice = null);
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p !== socket);
  });
});

function getResult(c1, c2) {
  if (c1 === c2) return ['مساوی', 'مساوی'];
  if (
    (c1 === 'rock' && c2 === 'scissors') ||
    (c1 === 'paper' && c2 === 'rock') ||
    (c1 === 'scissors' && c2 === 'paper')
  ) return ['بردی', 'باختی'];
  else return ['باختی', 'بردی'];
}

server.listen(process.env.PORT || 3000);
