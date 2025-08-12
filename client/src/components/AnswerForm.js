import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

const AnswerForm = ({ categories, currentLetter, onSubmit, timeLeft }) => {
  const { state } = useGame();
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Reset form when letter changes
    setAnswers({});
    setIsSubmitted(false);
  }, [currentLetter]);

  useEffect(() => {
    // Auto-submit when time runs out
    if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const handleAnswerChange = (category, value) => {
    setAnswers(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    setIsSubmitted(true);
    onSubmit(answers);
  };

  const getAnswerCount = () => {
    return Object.values(answers).filter(answer => answer && answer.trim()).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          اكتب كلمة واحدة لكل فئة تبدأ بالحرف:
        </h3>
        <div className="text-3xl font-bold text-accent-500">{currentLetter}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700 text-right">
              {category}
            </label>
            <input
              type="text"
              value={answers[category] || ''}
              onChange={(e) => handleAnswerChange(category, e.target.value)}
              className="input-field"
              placeholder={`${currentLetter}...`}
              disabled={isSubmitted}
              maxLength={20}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-600">
          الإجابات المكتملة: {getAnswerCount()} من {categories.length}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isSubmitted || timeLeft === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitted ? 'تم الإرسال' : 'إرسال الإجابات'}
        </motion.button>
      </div>

      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-green-600 font-medium"
        >
          تم إرسال إجاباتك! انتظر نتائج الجولة...
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnswerForm;
