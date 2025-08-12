const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const GameManager = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Game manager instance
const gameManager = new GameManager();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Khodar wa Fawakih Server is running' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create room
  socket.on('createRoom', (data) => {
    try {
      const { playerName, isPrivate, password } = data;
      const result = gameManager.createRoom(socket.id, playerName, isPrivate, password);
      
      if (result.success) {
        socket.join(result.room.id);
        socket.emit('roomCreated', {
          room: result.room,
          playerId: socket.id
        });
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (error) {
      socket.emit('error', { message: 'خطأ في إنشاء الغرفة' });
    }
  });

  // Join room
  socket.on('joinRoom', (data) => {
    try {
      const { roomId, playerName, password } = data;
      const result = gameManager.joinRoom(roomId, socket.id, playerName, password);
      
      if (result.success) {
        socket.join(roomId);
        socket.emit('roomJoined', {
          room: result.room,
          playerId: socket.id
        });
        
        // Notify other players
        socket.to(roomId).emit('playerJoined', result.player);
        
        // Send lobby update to all players
        const lobbyData = gameManager.getLobbyData(roomId);
        io.to(roomId).emit('lobbyUpdate', lobbyData);
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (error) {
      socket.emit('error', { message: 'خطأ في الانضمام للغرفة' });
    }
  });

  // Join lobby
  socket.on('joinLobby', (data) => {
    const { roomId, playerName } = data;
    const room = gameManager.getRoom(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'الغرفة غير موجودة', code: 'ROOM_NOT_FOUND' });
      return;
    }

    socket.join(roomId);
    
    // Try to reconnect if player name is provided
    if (playerName) {
      const reconnectResult = gameManager.reconnectPlayer(roomId, socket.id, playerName);
      if (reconnectResult.success) {
        console.log(`Player ${playerName} reconnected to room ${roomId}`);
      }
    }
    
    // Send lobby data
    const lobbyData = gameManager.getLobbyData(roomId);
    socket.emit('lobbyUpdate', lobbyData);
    
    // Notify other players
    socket.to(roomId).emit('playerJoined', { id: socket.id, name: 'Player' });
  });

  // Start game
  socket.on('startGame', (data) => {
    const { roomId, settings } = data;
    const room = gameManager.getRoom(roomId);
    
    if (room && room.hostId === socket.id) {
      const result = gameManager.startGame(roomId, settings);
      if (result.success) {
        io.to(roomId).emit('gameStarting');
        setTimeout(() => {
          io.to(roomId).emit('gameUpdate', result.gameData);
        }, 2000);
      } else {
        socket.emit('error', { message: result.error });
      }
    }
  });

  // Join game
  socket.on('joinGame', (data) => {
    const { roomId } = data;
    const room = gameManager.getRoom(roomId);
    
    if (room && room.gameState !== 'lobby') {
      const gameData = gameManager.getGameData(roomId);
      socket.emit('gameUpdate', gameData);
    }
  });

  // Submit answers
  socket.on('submitAnswers', (data) => {
    const { roomId, answers } = data;
    const result = gameManager.submitAnswers(roomId, socket.id, answers);
    
    if (result.success) {
      // Update game state for all players
      const gameData = gameManager.getGameData(roomId);
      io.to(roomId).emit('gameUpdate', gameData);
      
      // Check if all players submitted
      if (result.allSubmitted) {
        setTimeout(() => {
          const roundResults = gameManager.endRound(roomId);
          io.to(roomId).emit('gameUpdate', roundResults);
        }, 2000);
      }
    }
  });

  // Next round
  socket.on('nextRound', (data) => {
    const { roomId } = data;
    const room = gameManager.getRoom(roomId);
    
    if (room && room.hostId === socket.id) {
      const result = gameManager.nextRound(roomId);
      if (result.success) {
        io.to(roomId).emit('gameUpdate', result.gameData);
      }
    }
  });

  // Back to lobby
  socket.on('backToLobby', (data) => {
    const { roomId } = data;
    const result = gameManager.backToLobby(roomId);
    if (result.success) {
      io.to(roomId).emit('gameUpdate', result.gameData);
    }
  });

  // Leave room
  socket.on('leaveRoom', (data) => {
    const { roomId } = data;
    const result = gameManager.leaveRoom(roomId, socket.id);
    
    if (result.success) {
      socket.leave(roomId);
      
      // Notify other players
      if (result.player) {
        socket.to(roomId).emit('playerLeft', result.player);
      }
      
      // Update lobby for remaining players
      if (result.room) {
        const lobbyData = gameManager.getLobbyData(roomId);
        io.to(roomId).emit('lobbyUpdate', lobbyData);
      }
    }
  });

  // Kick player
  socket.on('kickPlayer', (data) => {
    const { roomId, playerId } = data;
    const room = gameManager.getRoom(roomId);
    
    console.log(`Kick attempt: Host ${socket.id} trying to kick ${playerId} from room ${roomId}`);
    console.log(`Room host: ${room?.hostId}, Current socket: ${socket.id}`);
    
    if (room && room.hostId === socket.id) {
      const result = gameManager.kickPlayer(roomId, playerId);
      console.log(`Kick result:`, result);
      
      if (result.success) {
        // Kick the player from socket room
        io.sockets.sockets.get(playerId)?.leave(roomId);
        io.sockets.sockets.get(playerId)?.emit('error', { message: 'تم طردك من الغرفة' });
        
        // Notify other players
        socket.to(roomId).emit('playerLeft', result.player);
        
        // Update lobby
        const lobbyData = gameManager.getLobbyData(roomId);
        io.to(roomId).emit('lobbyUpdate', lobbyData);
      } else {
        socket.emit('error', { message: result.error });
      }
    } else {
      socket.emit('error', { message: 'فقط المضيف يمكنه طرد اللاعبين' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all rooms
    const rooms = gameManager.getRoomsByPlayer(socket.id);
    rooms.forEach(roomId => {
      const result = gameManager.leaveRoom(roomId, socket.id);
      if (result.success && result.player) {
        socket.to(roomId).emit('playerLeft', result.player);
        
        if (result.room) {
          const lobbyData = gameManager.getLobbyData(roomId);
          io.to(roomId).emit('lobbyUpdate', lobbyData);
        }
      }
    });
  });
});

// Start timer for active games
setInterval(() => {
  const activeGames = gameManager.getActiveGames();
  activeGames.forEach(game => {
    if (game.gameState === 'playing' && game.timeLeft > 0) {
      const oldTime = game.timeLeft;
      gameManager.updateTimer(game.id);
      
      // Send updated game data to all players
      const updatedGameData = gameManager.getGameData(game.id);
      if (updatedGameData) {
        io.to(game.id).emit('gameUpdate', updatedGameData);
        
        // Debug log
        console.log(`Room ${game.id}: ${oldTime} -> ${updatedGameData.timeLeft}`);
        
        // Send time warnings
        if (game.timeLeft <= 10) {
          io.to(game.id).emit('timeWarning', game.timeLeft);
        }
        
        // Auto-end round when time runs out
        if (game.timeLeft === 0) {
          const roundResults = gameManager.endRound(game.id);
          io.to(game.id).emit('gameUpdate', roundResults);
        }
      }
    }
  });
}, 1000);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Khodar wa Fawakih Server running on port ${PORT}`);
  console.log(`📱 Frontend should be running on http://localhost:3000`);
});
