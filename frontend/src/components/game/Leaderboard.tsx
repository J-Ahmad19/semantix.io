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
    <Card className="flex flex-col h-full bg-slate-900 border-slate-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex items-center text-lg text-slate-200">
          <Crown className="w-5 h-5 mr-2 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {sortedPlayers.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
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

  let rowBg = 'bg-slate-800/30';
  let rowBorder = 'border-slate-700/20';

  if (isFlashing) {
    rowBg = 'bg-green-500/30';
    rowBorder = 'border-green-400/50';
  } else if (index === 0 && player.score > 0) {
    rowBg = 'bg-yellow-900/20';
    rowBorder = 'border-yellow-500/30';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-500 ${rowBg} ${rowBorder}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`font-mono w-6 text-center text-sm font-bold ${
          index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'
        }`}>
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
        </span>
        <div className="flex flex-col min-w-0">
          <span className={`font-semibold truncate ${index === 0 ? 'text-yellow-200' : 'text-slate-200'}`}>
            {player.name}
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${player.active ? 'text-green-500' : 'text-slate-600'}`}>
            {player.active ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>
      <div className={`font-bold font-mono text-xl ${
        index === 0 ? 'text-yellow-400' : 'text-blue-400'
      }`}>
        <AnimatedScore score={player.score} />
      </div>
    </motion.div>
  );
}
