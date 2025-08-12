import React from 'react';
import { motion } from 'framer-motion';

const Timer = ({ timeLeft }) => {
  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-red-500';
    if (timeLeft <= 20) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTimerSize = () => {
    if (timeLeft <= 10) return 'text-5xl';
    if (timeLeft <= 20) return 'text-4xl';
    return 'text-3xl';
  };

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex justify-center"
    >
      <div className="timer">
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`font-bold ${getTimerColor()} ${getTimerSize()}`}
        >
          {timeLeft}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default Timer;
