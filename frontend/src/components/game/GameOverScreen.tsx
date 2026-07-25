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
      className="absolute inset-0 z-50 flex items-center justify-center bg-game-bg/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="bg-game-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 max-w-lg w-full text-center mx-4"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          <Trophy className="w-16 h-16 mx-auto text-game-match mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-white uppercase tracking-tighter drop-shadow-md">
            Game Over!
          </h2>
          <p className="text-lg font-sans font-bold text-game-warm uppercase tracking-widest">
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
                className={`flex justify-between items-center p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  index === 0
                    ? 'bg-game-match/20 text-game-match'
                    : 'bg-game-bg text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 font-sans">
                  <span className="w-8 text-left text-2xl drop-shadow-md">{medals[index] || ''}</span>
                  <span className="font-bold truncate max-w-[180px] text-xl">
                    {player}
                  </span>
                </div>
                <div className="font-mono font-bold text-2xl">
                  {score}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          onClick={onPlayAgain}
          className="w-full py-4 bg-game-hot text-game-bg font-display font-bold uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all tracking-widest flex items-center justify-center gap-3 mt-8"
        >
          <RotateCcw className="w-6 h-6 border-black drop-shadow-sm" />
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
