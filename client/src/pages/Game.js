import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import toast from 'react-hot-toast';
import Timer from '../components/Timer';
import AnswerForm from '../components/AnswerForm';
import RoundResults from '../components/RoundResults';
import GameResults from '../components/GameResults';

const Game = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { state, dispatch } = useGame();
  
  const [gameData, setGameData] = useState({
    currentRound: 1,
    totalRounds: 5,
    timeLeft: 60,
    currentLetter: '',
            categories: ['فواكه', 'خضار', 'حيوان', 'بلد', 'جماد', 'لون', 'اسم ولد', 'اسم بنت', 'مدينة'],
    players: [],
    scores: {},
    roundResults: [],
    gameState: 'playing', // playing, scoring, finished
  });

  useEffect(() => {
    if (!socket) {
      navigate('/');
      return;
    }

    // Join the game room
    socket.emit('joinGame', { roomId });

    // Listen for game updates
    socket.on('gameUpdate', (data) => {
      setGameData(data);
      dispatch({ type: 'SET_GAME_STATE', payload: data.gameState });
      dispatch({ type: 'SET_CURRENT_ROUND', payload: data.currentRound });
      dispatch({ type: 'SET_TIME_LEFT', payload: data.timeLeft });
      dispatch({ type: 'SET_CURRENT_LETTER', payload: data.currentLetter });
      dispatch({ type: 'SET_PLAYERS', payload: data.players });
      dispatch({ type: 'SET_SCORES', payload: data.scores });
      dispatch({ type: 'SET_ROUND_RESULTS', payload: data.roundResults });
    });

    // Listen for round start
    socket.on('roundStart', (data) => {
      toast.success(`الجولة ${data.round} - الحرف: ${data.letter}`);
    });

    // Listen for time warnings
    socket.on('timeWarning', (timeLeft) => {
      if (timeLeft <= 10) {
        toast.error(`الوقت المتبقي: ${timeLeft} ثانية!`);
      }
    });

    // Listen for round end
    socket.on('roundEnd', () => {
      toast.success('انتهت الجولة!');
    });

    // Listen for game end
    socket.on('gameEnd', (finalResults) => {
      toast.success('انتهت اللعبة!');
    });

    // Listen for errors
    socket.on('error', (error) => {
      toast.error(error.message);
      if (error.code === 'GAME_NOT_FOUND') {
        navigate('/');
      }
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('roundStart');
      socket.off('timeWarning');
      socket.off('roundEnd');
      socket.off('gameEnd');
      socket.off('error');
    };
  }, [socket, roomId, navigate, dispatch]);

  const handleSubmitAnswers = (answers) => {
    socket.emit('submitAnswers', { roomId, answers });
    toast.success('تم إرسال الإجابات!');
  };

  const handleNextRound = () => {
    socket.emit('nextRound', { roomId });
  };

  const handleBackToLobby = () => {
    socket.emit('backToLobby', { roomId });
    navigate(`/lobby/${roomId}`);
  };

  const renderGameContent = () => {
    switch (gameData.gameState) {
      case 'playing':
        return (
          <div className="space-y-6">
            {/* Round Info */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-primary-600 mb-2">
                الجولة {gameData.currentRound} من {gameData.totalRounds}
              </h2>
              <div className="text-6xl font-bold text-accent-500 mb-4">
                {gameData.currentLetter}
              </div>
            </motion.div>

            {/* Timer */}
            <Timer timeLeft={gameData.timeLeft} />

            {/* Answer Form */}
            <AnswerForm
              categories={gameData.categories}
              currentLetter={gameData.currentLetter}
              onSubmit={handleSubmitAnswers}
              timeLeft={gameData.timeLeft}
            />
          </div>
        );

      case 'scoring':
        return (
          <RoundResults
            results={gameData.roundResults}
            currentRound={gameData.currentRound}
            totalRounds={gameData.totalRounds}
            scores={gameData.scores}
            players={gameData.players}
            onNextRound={handleNextRound}
            isLastRound={gameData.currentRound >= gameData.totalRounds}
          />
        );

      case 'finished':
        return (
          <GameResults
            finalResults={gameData.roundResults}
            scores={gameData.scores}
            players={gameData.players}
            onBackToLobby={handleBackToLobby}
          />
        );

      default:
        return <div>جاري التحميل...</div>;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6"
        >
          <div className="flex justify-between items-center">
            <div className="text-right">
              <h1 className="text-xl font-bold text-primary-600">خضر و فواكه</h1>
              <p className="text-sm text-gray-600">غرفة {roomId}</p>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600">اللاعبون</div>
              <div className="flex space-x-1 space-x-reverse">
                {gameData.players.slice(0, 5).map((player) => (
                  <div
                    key={player.id}
                    className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    title={player.name}
                  >
                    {player.name.charAt(0)}
                  </div>
                ))}
                {gameData.players.length > 5 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                    +{gameData.players.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Game Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={gameData.gameState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="card p-6"
          >
            {renderGameContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Game;
