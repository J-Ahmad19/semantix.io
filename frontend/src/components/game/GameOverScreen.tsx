'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  winners: string[];
  totalScores: Record<string, number>;
  onPlayAgain: () => void;
}

export function GameOverScreen({ winners, totalScores, onPlayAgain }: GameOverScreenProps) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-8 max-w-lg w-full text-center mx-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
          <h2 className="text-4xl font-bold mb-2 text-white">
            Game Over!
          </h2>
          <p className="text-lg font-medium bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent uppercase tracking-widest">
            Final Leaderboard
          </p>
        </motion.div>

        <div className="space-y-3 my-8">
          {winners.map((player, index) => {
            const score = totalScores[player];

            return (
              <motion.div
                key={player}
                initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex justify-between items-center p-4 rounded-xl border ${
                  index === 0
                    ? 'bg-yellow-900/20 border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-left text-xl">{medals[index] || ''}</span>
                  <span className={`font-semibold truncate max-w-[180px] ${
                    index === 0 ? 'text-yellow-300 text-xl font-bold' : 'text-slate-300'
                  }`}>
                    {player}
                  </span>
                </div>
                <div className={`font-mono font-bold ${
                  index === 0 ? 'text-yellow-400 text-xl' : 'text-slate-400'
                }`}>
                  {score} pts
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlayAgain}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
