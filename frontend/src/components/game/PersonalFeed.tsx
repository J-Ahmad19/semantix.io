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
  if (score === 100) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]';
  if (score >= 80) return 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
  if (score >= 50) return 'bg-orange-400';
  return 'bg-blue-500';
}

function getScoreText(score: number) {
  if (score === 100) return 'text-yellow-400 font-bold drop-shadow-sm';
  if (score >= 80) return 'text-red-400 font-bold';
  if (score >= 50) return 'text-orange-400 font-semibold';
  return 'text-slate-400';
}

export function PersonalFeed({ feeds }: PersonalFeedProps) {
  return (
    <Card className="flex flex-col h-full bg-slate-900 border-slate-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center text-lg text-slate-200">
          <Trophy className="w-5 h-5 mr-2 text-blue-400" />
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
                className="flex flex-col space-y-2 p-3 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium truncate max-w-[70%] ${guess.score === 100 ? 'text-yellow-400 font-bold italic' : 'text-slate-300'}`}>
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
