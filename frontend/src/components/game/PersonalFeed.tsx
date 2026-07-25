'use client';

import React from 'react';
import { GuessResult } from '@/types/game';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface PersonalFeedProps {
  feeds: GuessResult[];
}

function getScoreColor(score: number) {
  if (score === 100) return 'bg-game-match shadow-[0_0_10px_#00FF00]';
  if (score >= 80) return 'bg-game-fire shadow-[0_0_8px_#FF0055]';
  if (score >= 50) return 'bg-game-hot shadow-[0_0_8px_#FF9900]';
  return 'bg-game-cold';
}

function getScoreText(score: number) {
  if (score === 100) return 'text-game-match font-bold drop-shadow-sm';
  if (score >= 80) return 'text-game-fire font-bold';
  if (score >= 50) return 'text-game-hot font-semibold';
  return 'text-game-cold';
}

export function PersonalFeed({ feeds }: PersonalFeedProps) {
  return (
    <Card className="flex flex-col h-full bg-game-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
      <CardHeader className="pb-3 border-b-4 border-black">
        <CardTitle className="flex items-center text-game-match drop-shadow-md">
          <Trophy className="w-5 h-5 mr-2" />
          Your Guesses
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {feeds.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-500 mt-10"
            >
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Start guessing!</p>
            </motion.div>
          ) : (
            feeds.map((guess) => (
              <motion.div
                layout
                key={`${guess.timestamp}-${guess.word}`}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex flex-col space-y-2 p-3 rounded-xl bg-game-surface border-2 border-black hover:bg-game-surface/80 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex justify-between items-center text-sm font-sans">
                  <span className={`font-medium truncate max-w-[70%] text-lg ${guess.score === 100 ? 'text-game-match font-bold italic' : 'text-slate-200'}`}>
                    {guess.word}
                  </span>
                  <span className={`font-mono text-right ${getScoreText(guess.score)}`}>
                    {guess.score}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner border border-slate-700/50">
                  <motion.div
                    className={`h-full rounded-full ${getScoreColor(guess.score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${guess.score}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
