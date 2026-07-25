'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Player } from '@/types/game';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';

interface LeaderboardProps {
  players: Record<string, Player>;
}

function AnimatedScore({ score }: { score: number }) {
  const [display, setDisplay] = useState(score);
  const prevRef = useRef(score);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === score) return;

    const diff = score - prev;
    const steps = Math.min(Math.abs(diff), 20);
    const increment = diff / steps;
    let current = prev;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(score);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, 30);

    prevRef.current = score;
    return () => clearInterval(timer);
  }, [score]);

  return <span>{display}</span>;
}

export function Leaderboard({ players }: LeaderboardProps) {
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <Card className="flex flex-col h-full bg-game-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl">
      <CardHeader className="pb-3 border-b-4 border-black">
        <CardTitle className="flex items-center text-game-warm drop-shadow-md">
          <Crown className="w-5 h-5 mr-2 text-game-hot" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {sortedPlayers.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 font-sans font-bold">
              <Crown className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Waiting for players...</p>
            </div>
          ) : (
            sortedPlayers.map((player, index) => {
              return (
                <LeaderboardRow 
                  key={player.name}
                  player={player}
                  index={index}
                />
              );
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Separated into a component to easily manage individual flash animations on score changes
function LeaderboardRow({ player, index }: { player: Player, index: number }) {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevScore = useRef(player.score);

  useEffect(() => {
    if (player.score > prevScore.current) {
      setIsFlashing(true);
      const t = setTimeout(() => setIsFlashing(false), 800);
      return () => clearTimeout(t);
    }
    prevScore.current = player.score;
  }, [player.score]);

  let rowBg = 'bg-game-bg';
  let rowBorder = 'border-black';

  if (isFlashing) {
    rowBg = 'bg-game-match/30';
    rowBorder = 'border-game-match';
  } else if (index === 0 && player.score > 0) {
    rowBg = 'bg-game-hot/20';
    rowBorder = 'border-game-hot';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex justify-between items-center p-3 rounded-xl border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 ${rowBg} ${rowBorder}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`font-mono w-6 text-center text-lg font-bold ${
          index === 0 ? 'text-game-hot drop-shadow-sm' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-game-warm' : 'text-slate-500'
        }`}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
        </span>
        <div className="flex flex-col min-w-0 font-sans">
          <span className={`font-bold text-lg truncate ${index === 0 ? 'text-game-hot' : 'text-slate-100'}`}>
            {player.name}
          </span>
          <span className={`text-xs uppercase font-bold tracking-wider ${player.active ? 'text-game-match' : 'text-slate-600'}`}>
            {player.active ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>
      <div className={`font-bold font-mono text-3xl ${
        index === 0 ? 'text-game-hot drop-shadow-md' : 'text-game-cold'
      }`}>
        <AnimatedScore score={player.score} />
      </div>
    </motion.div>
  );
}
