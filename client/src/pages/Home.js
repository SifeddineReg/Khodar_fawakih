import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const { socket, connect } = useSocket();
  const { dispatch } = useGame();
  
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error('يرجى إدخال اسم اللاعب');
      return;
    }

    setIsLoading(true);
    
    try {
      connect();
      
      socket.emit('createRoom', {
        playerName: playerName.trim(),
        isPrivate,
        password: isPrivate ? roomPassword : null,
      });

      socket.once('roomCreated', (data) => {
        dispatch({ type: 'SET_PLAYER', payload: { name: playerName.trim(), id: data.playerId } });
        dispatch({ type: 'SET_ROOM', payload: data.room });
        dispatch({ type: 'SET_IS_HOST', payload: true });
        toast.success('تم إنشاء الغرفة بنجاح!');
        navigate(`/lobby/${data.room.id}`);
      });

      socket.once('error', (error) => {
        toast.error(error.message);
        setIsLoading(false);
      });
    } catch (error) {
      toast.error('خطأ في إنشاء الغرفة');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomId.trim()) {
      toast.error('يرجى إدخال اسم اللاعب ورقم الغرفة');
      return;
    }

    setIsLoading(true);
    
    try {
      connect();
      
      socket.emit('joinRoom', {
        roomId: roomId.trim(),
        playerName: playerName.trim(),
        password: roomPassword,
      });

      socket.once('roomJoined', (data) => {
        dispatch({ type: 'SET_PLAYER', payload: { name: playerName.trim(), id: data.playerId } });
        dispatch({ type: 'SET_ROOM', payload: data.room });
        dispatch({ type: 'SET_IS_HOST', payload: false });
        toast.success('تم الانضمام للغرفة بنجاح!');
        navigate(`/lobby/${data.room.id}`);
      });

      socket.once('error', (error) => {
        toast.error(error.message);
        setIsLoading(false);
      });
    } catch (error) {
      toast.error('خطأ في الانضمام للغرفة');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-8 max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary-600 mb-2">خضر و فواكه</h1>
          <p className="text-gray-600">لعبة الكلمات العربية المتعددة اللاعبين</p>
        </motion.div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              اسم اللاعب
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input-field"
              placeholder="أدخل اسمك"
              maxLength={20}
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="private" className="text-sm text-gray-700">
              غرفة خاصة
            </label>
          </div>

          {isPrivate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                كلمة المرور
              </label>
              <input
                type="password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="input-field"
                placeholder="كلمة المرور"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء غرفة جديدة'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">أو</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                رقم الغرفة
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="input-field"
                placeholder="أدخل رقم الغرفة"
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الانضمام...' : 'انضم لغرفة موجودة'}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>استمتع بلعب الكلمات العربية مع أصدقائك!</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
