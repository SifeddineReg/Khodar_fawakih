const fs = require('fs');
const path = require('path');
const { validateArabicWord } = require('./utils/arabicUtils');

// Load wordlists into memory for fast lookup
const CATEGORY_WORDLISTS = {
  'فواكه': 'fruits.txt',
  'خضار': 'vegetables.txt',
  'حيوان': 'animals.txt',
  'بلد': 'countries.txt',
  'جماد': 'objects.txt',
  'لون': 'colors.txt',
};

const WORDLISTS = {};
for (const [cat, file] of Object.entries(CATEGORY_WORDLISTS)) {
  const filePath = path.join(__dirname, 'wordlists', file);
  if (fs.existsSync(filePath)) {
    WORDLISTS[cat] = new Set(
      fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .map(w => w.trim())
        .filter(Boolean)
    );
  } else {
    WORDLISTS[cat] = new Set();
  }
}

class GameManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map(); // socketId -> roomId
    this.roomTimeouts = new Map(); // roomId -> timeout
  }

  // Room Management
  createRoom(socketId, playerName, isPrivate = false, password = null) {
    try {
      const roomId = this.generateRoomId();
      const player = {
        id: socketId,
        name: playerName,
        isHost: true
      };

      const room = {
        id: roomId,
        hostId: socketId,
        isPrivate,
        password,
        players: [player],
        gameState: 'lobby',
        settings: {
          roundTime: 60,
          totalRounds: 5,
          categories: ['فواكه', 'خضار', 'حيوان', 'بلد', 'جماد', 'لون']
        },
        currentRound: 0,
        timeLeft: 60,
        currentLetter: '',
        answers: {},
        scores: {},
        roundResults: [],
        submittedPlayers: new Set()
      };

      this.rooms.set(roomId, room);
      this.playerRooms.set(socketId, roomId);

      return { success: true, room };
    } catch (error) {
      return { success: false, error: 'خطأ في إنشاء الغرفة' };
    }
  }

  joinRoom(roomId, socketId, playerName, password = null) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'الغرفة غير موجودة' };
    }

    if (room.isPrivate && room.password !== password) {
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    if (room.gameState !== 'lobby') {
      return { success: false, error: 'اللعبة قد بدأت بالفعل' };
    }

    if (room.players.length >= 8) {
      return { success: false, error: 'الغرفة ممتلئة' };
    }

    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      return { success: false, error: 'اسم اللاعب مستخدم بالفعل' };
    }

    const player = {
      id: socketId,
      name: playerName,
      isHost: false
    };

    room.players.push(player);
    this.playerRooms.set(socketId, roomId);

    return { success: true, room, player };
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getLobbyData(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      players: room.players,
      settings: room.settings,
      isPrivate: room.isPrivate
    };
  }

  getGameData(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      currentRound: room.currentRound,
      totalRounds: room.settings.totalRounds,
      timeLeft: room.timeLeft,
      currentLetter: room.currentLetter,
      categories: room.settings.categories,
      players: room.players,
      scores: room.scores,
      roundResults: room.roundResults,
      gameState: room.gameState
    };
  }

  getActiveGames() {
    return Array.from(this.rooms.values()).filter(room => room.gameState !== 'lobby');
  }

  getRoomsByPlayer(socketId) {
    const roomId = this.playerRooms.get(socketId);
    return roomId ? [roomId] : [];
  }

  // Game Logic
  startGame(roomId, settings) {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) {
      return { success: false, error: 'يحتاج على الأقل لاعبين اثنين' };
    }

    // Update settings
    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }

    // Initialize game
    room.gameState = 'playing';
    room.currentRound = 1;
    room.currentLetter = this.generateArabicLetter();
    room.timeLeft = room.settings.roundTime;
    room.answers = {};
    room.scores = {};
    room.roundResults = [];
    room.submittedPlayers.clear();

    // Initialize scores
    room.players.forEach(player => {
      room.scores[player.id] = 0;
    });

    return { success: true, gameData: this.getGameData(roomId) };
  }

  submitAnswers(roomId, socketId, answers) {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') {
      return { success: false, error: 'اللعبة غير نشطة' };
    }

    // Store answers
    room.answers[socketId] = answers;
    room.submittedPlayers.add(socketId);

    const allSubmitted = room.submittedPlayers.size === room.players.length;

    return { success: true, allSubmitted };
  }

  endRound(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Calculate scores
    const roundResults = this.calculateRoundScores(room);
    room.roundResults = roundResults;

    // Update total scores
    roundResults.forEach(result => {
      const roundScore = Object.values(result.answers).reduce((sum, answer) => sum + answer.score, 0);
      room.scores[result.playerId] += roundScore;
    });

    // Check if game is finished
    if (room.currentRound >= room.settings.totalRounds) {
      room.gameState = 'finished';
    } else {
      room.gameState = 'scoring';
    }

    return this.getGameData(roomId);
  }

  nextRound(roomId) {
    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'scoring') {
      return { success: false, error: 'لا يمكن بدء جولة جديدة' };
    }

    room.currentRound++;
    room.currentLetter = this.generateArabicLetter();
    room.timeLeft = room.settings.roundTime;
    room.answers = {};
    room.submittedPlayers.clear();
    room.gameState = 'playing';

    return { success: true, gameData: this.getGameData(roomId) };
  }

  backToLobby(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'الغرفة غير موجودة' };
    }

    room.gameState = 'lobby';
    room.currentRound = 0;
    room.timeLeft = 60;
    room.currentLetter = '';
    room.answers = {};
    room.scores = {};
    room.roundResults = [];
    room.submittedPlayers.clear();

    return { success: true, gameData: this.getGameData(roomId) };
  }

  updateTimer(roomId) {
    const room = this.rooms.get(roomId);
    if (room && room.gameState === 'playing' && room.timeLeft > 0) {
      room.timeLeft--;
    }
  }

  // Player Management
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false };
    }

    const playerIndex = room.players.findIndex(p => p.id === socketId);
    if (playerIndex === -1) {
      return { success: false };
    }

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);

    // Remove from submitted players
    room.submittedPlayers.delete(socketId);

    // Remove from answers
    delete room.answers[socketId];

    // Remove from scores
    delete room.scores[socketId];

    // If host left, assign new host
    if (room.hostId === socketId && room.players.length > 0) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
    }

    // If no players left, schedule room deletion (30 minutes timeout)
    if (room.players.length === 0) {
      this.scheduleRoomDeletion(roomId);
    } else {
      // Clear any existing timeout since players are back
      this.clearRoomTimeout(roomId);
    }

    this.playerRooms.delete(socketId);

    return { success: true, player, room: room.players.length > 0 ? room : null };
  }

  scheduleRoomDeletion(roomId) {
    // Clear existing timeout if any
    this.clearRoomTimeout(roomId);
    
    // Schedule room deletion after 30 minutes
    const timeout = setTimeout(() => {
      this.rooms.delete(roomId);
      this.roomTimeouts.delete(roomId);
      console.log(`Room ${roomId} deleted due to inactivity`);
    }, 30 * 60 * 1000); // 30 minutes
    
    this.roomTimeouts.set(roomId, timeout);
  }

  clearRoomTimeout(roomId) {
    const timeout = this.roomTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      this.roomTimeouts.delete(roomId);
    }
  }

  // Handle player reconnection
  reconnectPlayer(roomId, socketId, playerName) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'الغرفة غير موجودة' };
    }

    // Check if player exists in room
    const existingPlayer = room.players.find(p => p.name === playerName);
    if (!existingPlayer) {
      return { success: false, error: 'اللاعب غير موجود في الغرفة' };
    }

    // Update player's socket ID
    existingPlayer.id = socketId;
    this.playerRooms.set(socketId, roomId);

    // Clear room timeout since player is back
    this.clearRoomTimeout(roomId);

    return { success: true, room, player: existingPlayer };
  }

  kickPlayer(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'الغرفة غير موجودة' };
    }
    
    // Check if the player being kicked exists in the room
    const playerExists = room.players.find(p => p.id === playerId);
    if (!playerExists) {
      return { success: false, error: 'اللاعب غير موجود في الغرفة' };
    }

    return this.leaveRoom(roomId, playerId);
  }

  // Scoring Logic
  calculateRoundScores(room) {
    const results = [];
    const allAnswers = {};

    // Collect all answers by category
    room.players.forEach(player => {
      const playerAnswers = room.answers[player.id] || {};
      results.push({
        playerId: player.id,
        answers: {}
      });

      room.settings.categories.forEach(category => {
        const answer = playerAnswers[category];
        if (!allAnswers[category]) {
          allAnswers[category] = [];
        }
        if (answer && answer.trim()) {
          allAnswers[category].push({
            playerId: player.id,
            answer: answer.trim().toLowerCase()
          });
        }
      });
    });

    // Calculate scores for each player
    results.forEach(result => {
      const playerAnswers = room.answers[result.playerId] || {};
      
      room.settings.categories.forEach(category => {
        const answer = playerAnswers[category];
        let score = 0;

        if (answer && answer.trim()) {
          const trimmedAnswer = answer.trim().toLowerCase();
          // Check if answer starts with the correct letter
          if (validateArabicWord(trimmedAnswer, room.currentLetter)) {
            // Check if answer is in the category wordlist
            if (WORDLISTS[category] && WORDLISTS[category].has(trimmedAnswer)) {
              // Check if answer is unique
              const categoryAnswers = allAnswers[category] || [];
              const sameAnswers = categoryAnswers.filter(a => a.answer === trimmedAnswer);
              if (sameAnswers.length === 1) {
                score = 10; // Unique answer
              } else {
                score = 5; // Duplicate answer
              }
            }
          }
        }

        result.answers[category] = {
          answer: answer || '',
          score: score
        };
      });
    });

    return results;
  }

  // Utility Methods
  generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateArabicLetter() {
    // More common Arabic letters with weighted distribution
    const commonLetters = [
      'أ', 'أ', 'أ', // أ is very common
      'ب', 'ب', 'ب', 'ب', // ب is very common
      'ت', 'ت', 'ت', // ت is very common
      'ج', 'ج', 'ج', // ج is very common
      'ح', 'ح', // ح is common
      'خ', 'خ', // خ is common
      'د', 'د', 'د', // د is very common
      'ر', 'ر', 'ر', // ر is very common
      'س', 'س', 'س', 'س', // س is very common
      'ش', 'ش', 'ش', // ش is very common
      'ص', 'ص', // ص is common
      'ض', // ض is less common
      'ط', 'ط', // ط is common
      'ظ', // ظ is less common
      'ع', 'ع', 'ع', // ع is very common
      'غ', 'غ', // غ is common
      'ف', 'ف', 'ف', // ف is very common
      'ق', 'ق', 'ق', // ق is very common
      'ك', 'ك', 'ك', // ك is very common
      'ل', 'ل', 'ل', 'ل', // ل is very common
      'م', 'م', 'م', 'م', // م is very common
      'ن', 'ن', 'ن', // ن is very common
      'ه', 'ه', 'ه', // ه is very common
      'و', 'و', 'و', // و is very common
      'ي', 'ي', 'ي', 'ي' // ي is very common
    ];
    return commonLetters[Math.floor(Math.random() * commonLetters.length)];
  }
}

module.exports = GameManager;
