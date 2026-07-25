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
    <Card className="flex flex-col h-full bg-game-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
      <CardHeader className="pb-3 border-b-4 border-black">
        <CardTitle className="flex items-center text-game-cold drop-shadow-md">
          Global Feed <span className="ml-2 text-[10px] text-slate-400 font-sans tracking-normal font-bold normal-case">(&ge;50% match)</span>
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
                // Match
                colorClass = "text-game-match";
                indicatorColor = "bg-game-match";
                borderClass = "border-black";
                bgClass = "bg-game-match/10";
                Icon = Trophy;
                isPerfect = true;
                wordStyle = "text-xl italic text-game-match font-bold drop-shadow-md";
              } else if (guess.score >= 80) {
                // Fire
                colorClass = "text-game-fire";
                indicatorColor = "bg-game-fire";
                borderClass = "border-black";
                bgClass = "bg-game-fire/10";
                Icon = Flame;
                wordStyle = "text-xl font-bold text-game-fire animate-pulse";
              } else if (guess.score >= 50) {
                // Hot
                colorClass = "text-game-hot";
                indicatorColor = "bg-game-hot";
                borderClass = "border-black";
                bgClass = "bg-game-surface";
                Icon = ThermometerSun;
                wordStyle = "text-xl text-game-hot font-semibold";
              } else {
                // Cold
                borderClass = "border-black";
                bgClass = "bg-game-surface";
                wordStyle = "text-xl text-slate-300";
              }

              return (
                <motion.div 
                  layout
                  key={`${guess.timestamp}-${guess.player}-${guess.word}`}
                  initial={{ y: -20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`flex flex-col space-y-2 p-3 rounded-xl border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${bgClass} ${borderClass}`}
                >
                  <div className="flex justify-between items-center text-base font-sans">
                    <span className={`font-bold ${isPerfect ? 'text-game-match' : 'text-slate-100'}`}>
                      {guess.player}
                    </span>
                    <span className={`flex items-center font-bold ${colorClass}`}>
                      <Icon className="w-5 h-5 mr-1" />
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
