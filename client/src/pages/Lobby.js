import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import toast from 'react-hot-toast';

const Lobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  
  const [players, setPlayers] = useState([]);
  const [gameSettings, setGameSettings] = useState({
    roundTime: 60,
    totalRounds: 5,
    categories: ['فواكه', 'خضار', 'حيوان', 'بلد', 'جماد', 'لون'],
  });

  useEffect(() => {
    if (!socket) {
      navigate('/');
      return;
    }

    // Join the room
    socket.emit('joinLobby', { roomId });

    // Listen for lobby updates
    socket.on('lobbyUpdate', (data) => {
      setPlayers(data.players);
      if (data.settings) {
        setGameSettings(data.settings);
      }
    });

    // Listen for game start
    socket.on('gameStarting', () => {
      toast.success('اللعبة ستبدأ قريباً!');
      setTimeout(() => {
        navigate(`/game/${roomId}`);
      }, 2000);
    });

    // Listen for player joined
    socket.on('playerJoined', (player) => {
      toast.success(`${player.name} انضم للغرفة`);
    });

    // Listen for player left
    socket.on('playerLeft', (player) => {
      toast.error(`${player.name} غادر الغرفة`);
    });

    // Listen for errors
    socket.on('error', (error) => {
      toast.error(error.message);
      if (error.code === 'ROOM_NOT_FOUND') {
        navigate('/');
      }
    });

    return () => {
      socket.off('lobbyUpdate');
      socket.off('gameStarting');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('error');
    };
  }, [socket, roomId, navigate]);

  const handleStartGame = () => {
    if (players.length < 2) {
      toast.error('يحتاج على الأقل لاعبين اثنين لبدء اللعبة');
      return;
    }

    socket.emit('startGame', { roomId, settings: gameSettings });
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { roomId });
    navigate('/');
  };

  const handleKickPlayer = (playerId) => {
    socket.emit('kickPlayer', { roomId, playerId });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('تم نسخ رقم الغرفة');
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary-600">غرفة اللعب</h1>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm text-gray-600">رقم الغرفة:</span>
              <button
                onClick={copyRoomId}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-mono"
              >
                {roomId}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Players List */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-right">اللاعبون ({players.length})</h2>
              <div className="space-y-2">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                        <span className="font-medium">{player.name}</span>
                        {player.isHost && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            المضيف
                          </span>
                        )}
                      </div>
                      {state.isHost && !player.isHost && (
                        <button
                          onClick={() => handleKickPlayer(player.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          طرد
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Game Settings */}
            {state.isHost && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-right">إعدادات اللعبة</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      وقت الجولة (ثانية)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="120"
                      value={gameSettings.roundTime}
                      onChange={(e) => setGameSettings({
                        ...gameSettings,
                        roundTime: parseInt(e.target.value)
                      })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      عدد الجولات
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={gameSettings.totalRounds}
                      onChange={(e) => setGameSettings({
                        ...gameSettings,
                        totalRounds: parseInt(e.target.value)
                      })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4 space-x-reverse mt-6">
            {state.isHost && (
              <button
                onClick={handleStartGame}
                disabled={players.length < 2}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بدء اللعبة
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="btn-secondary"
            >
              مغادرة الغرفة
            </button>
          </div>
        </motion.div>

        {/* Waiting Message */}
        {!state.isHost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600"
          >
            <p>في انتظار المضيف لبدء اللعبة...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
