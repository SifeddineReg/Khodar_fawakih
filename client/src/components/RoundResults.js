import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

const RoundResults = ({ results, currentRound, totalRounds, scores, players, onNextRound, isLastRound }) => {
  const { state } = useGame();

  const getScoreColor = (score) => {
    if (score === 10) return 'text-green-600';
    if (score === 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score === 10) return '✅';
    if (score === 5) return '⚠️';
    return '❌';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-600 mb-2">
          نتائج الجولة {currentRound}
        </h2>
        <p className="text-gray-600">من {totalRounds} جولة</p>
      </div>

      {/* Scores Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-right">النقاط الإجمالية</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center p-3 rounded-lg ${
                player.id === state.player?.id ? 'bg-primary-100 border-2 border-primary-300' : 'bg-white'
              }`}
            >
              <div className="font-bold text-lg">{player.name}</div>
              <div className="text-2xl font-bold text-primary-600">
                {scores[player.id] || 0}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-right">تفاصيل الإجابات</h3>
        
        {results.map((playerResult, index) => (
          <motion.div
            key={playerResult.playerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg p-4 border-2 ${
              playerResult.playerId === state.player?.id ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-500">
                {playerResult.playerId === state.player?.id ? '(أنت)' : ''}
              </div>
              <div className="font-bold text-lg">
                {players.find(p => p.id === playerResult.playerId)?.name}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(playerResult.answers).map(([category, answerData]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm">{getScoreIcon(answerData.score)}</span>
                    <span className={`font-medium ${getScoreColor(answerData.score)}`}>
                      {answerData.score}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{category}</div>
                    <div className="font-medium">
                      {answerData.answer || '---'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">مجموع الجولة:</span>
                <span className="font-bold text-lg text-primary-600">
                  {Object.values(playerResult.answers).reduce((sum, answer) => sum + answer.score, 0)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Round Button */}
      <div className="flex justify-center pt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextRound}
          className="btn-primary"
        >
          {isLastRound ? 'إنهاء اللعبة' : 'الجولة التالية'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RoundResults;
