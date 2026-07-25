'use client';

import React, { useEffect, useRef } from 'react';
import { GuessResult } from '@/types/game';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, ThermometerSun, Snowflake, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalFeedProps {
  feeds: GuessResult[];
}

export function GlobalFeed({ feeds }: GlobalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [feeds]);

  return (
    <Card className="flex flex-col h-full bg-slate-900 border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center text-lg text-slate-200">
          Global Feed <span className="ml-2 text-xs text-slate-400 font-normal">(&ge;50% match)</span>
        </CardTitle>
      </CardHeader>
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {feeds.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-500 mt-10"
            >
              No hot guesses yet...
            </motion.div>
          ) : (
            feeds.map((guess) => {
              let colorClass = "text-slate-400";
              let indicatorColor = "bg-slate-500";
              let borderClass = "border-transparent";
              let bgClass = "bg-slate-800/50";
              let Icon = Snowflake;
              let isPerfect = false;
              let wordStyle = "text-lg text-slate-300";

              if (guess.score === 100) {
                // Blazing gold with scale bounce
                colorClass = "text-yellow-400";
                indicatorColor = "bg-yellow-400";
                borderClass = "border-yellow-500/50";
                bgClass = "bg-yellow-900/20";
                Icon = Trophy;
                isPerfect = true;
                wordStyle = "text-lg italic text-yellow-400 font-bold drop-shadow-md";
              } else if (guess.score >= 80) {
                // Pulsing red/orange gradient text
                colorClass = "text-red-400";
                indicatorColor = "bg-red-500";
                borderClass = "border-red-500/20";
                bgClass = "bg-red-950/20";
                Icon = Flame;
                wordStyle = "text-lg font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent animate-pulse";
              } else if (guess.score >= 50) {
                // Soft yellow/orange outline
                colorClass = "text-orange-400";
                indicatorColor = "bg-orange-500";
                borderClass = "border-orange-500/30";
                bgClass = "bg-slate-800/80";
                Icon = ThermometerSun;
                wordStyle = "text-lg text-orange-200";
              }

              return (
                <motion.div 
                  layout
                  key={`${guess.timestamp}-${guess.player}-${guess.word}`}
                  initial={{ y: -20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`flex flex-col space-y-2 p-3 rounded-md border ${bgClass} ${borderClass}`}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className={`font-semibold ${isPerfect ? 'text-yellow-400' : 'text-slate-300'}`}>
                      {guess.player}
                    </span>
                    <span className={`flex items-center font-bold ${colorClass}`}>
                      <Icon className="w-4 h-4 mr-1" />
                      {guess.score}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    {isPerfect ? (
                      <span className={wordStyle}>Guessed the word!</span>
                    ) : (
                      <span className={wordStyle}>{guess.word}</span>
                    )}
                  </div>
                  <Progress value={guess.score} indicatorColor={indicatorColor} className="h-1.5" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
