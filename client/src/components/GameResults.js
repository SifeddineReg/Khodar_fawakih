import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

const GameResults = ({ finalResults, scores, players, onBackToLobby }) => {
  const { state } = useGame();

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.length > 1 && (scores[sortedPlayers[0].id] || 0) === (scores[sortedPlayers[1].id] || 0);

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}`;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-100 border-yellow-300';
      case 2: return 'bg-gray-100 border-gray-300';
      case 3: return 'bg-orange-100 border-orange-300';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary-600 mb-2">انتهت اللعبة!</h2>
        <p className="text-gray-600">النتائج النهائية</p>
      </div>

      {/* Winner Announcement */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-center p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300"
      >
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-xl font-bold text-yellow-700 mb-1">
          {isTie ? 'تعادل!' : 'الفائز!'}
        </h3>
        <p className="text-lg text-yellow-600">
          {isTie 
            ? `${winner.name} و ${sortedPlayers[1].name}`
            : winner.name
          }
        </p>
        <p className="text-sm text-yellow-500">
          النقاط: {scores[winner.id] || 0}
        </p>
      </motion.div>

      {/* Final Standings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">الترتيب النهائي</h3>
        
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex justify-between items-center p-4 rounded-lg border-2 ${getPositionColor(index + 1)} ${
                player.id === state.player?.id ? 'ring-2 ring-primary-300' : ''
              }`}
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <span className="text-2xl">{getPositionIcon(index + 1)}</span>
                <div>
                  <div className="font-bold text-lg">{player.name}</div>
                  {player.id === state.player?.id && (
                    <div className="text-sm text-primary-600">(أنت)</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {scores[player.id] || 0}
                </div>
                <div className="text-sm text-gray-500">نقطة</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-center">إحصائيات اللعبة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{players.length}</div>
            <div className="text-sm text-gray-600">لاعب</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {Math.max(...Object.values(scores))}
            </div>
            <div className="text-sm text-gray-600">أعلى نقاط</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / players.length)}
            </div>
            <div className="text-sm text-gray-600">متوسط النقاط</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {finalResults.length}
            </div>
            <div className="text-sm text-gray-600">جولة</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 space-x-reverse pt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBackToLobby}
          className="btn-primary"
        >
          العودة للغرفة
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500"
      >
        <p>شكراً للعب خضر و فواكه! 🍎🥬</p>
      </motion.div>
    </motion.div>
  );
};

export default GameResults;
