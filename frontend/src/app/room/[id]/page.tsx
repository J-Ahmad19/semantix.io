'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGameState } from '@/hooks/useGameState';
import { GlobalFeed } from '@/components/game/GlobalFeed';
import { PersonalFeed } from '@/components/game/PersonalFeed';
import { Leaderboard } from '@/components/game/Leaderboard';
import { GuessInput } from '@/components/game/GuessInput';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { WaitingRoom } from '@/components/game/WaitingRoom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name');
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [wsUrl, setWsUrl] = useState('');

  useEffect(() => {
    if (!playerName) {
      router.push('/');
      return;
    }
    setWsUrl(`ws://localhost:8000/ws/${roomId}/${encodeURIComponent(playerName)}`);
  }, [playerName, roomId, router]);

  const gameState = useGameState();

  const { isConnected, sendMessage } = useWebSocket({
    url: wsUrl,
    onMessage: (event) => gameState.handleEvent(event, playerName!),
  });

  const handleGuess = (word: string) => {
    sendMessage('GUESS', { word });
  };

  const handlePlayAgain = () => {
    sendMessage('PLAY_AGAIN', {});
  };

  const handleStartGame = () => {
    sendMessage('START_GAME', {});
  };

  if (!playerName) return null;

  if (!gameState.gameStarted) {
    return (
      <WaitingRoom
        roomId={roomId}
        players={gameState.players}
        host={gameState.host}
        currentPlayer={playerName}
        onStartGame={handleStartGame}
      />
    );
  }

  const isUrgent = gameState.timeLeft <= 10 && gameState.timeLeft > 0;
  const isPaused = !!gameState.winMessage || !!gameState.gameOver;
  const minutes = Math.floor(gameState.timeLeft / 60);
  const seconds = (gameState.timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col h-dvh max-h-dvh overflow-hidden p-3 md:p-5 bg-[#0a0a0a] text-white">
      <AnimatePresence>
        {gameState.gameOver && (
          <GameOverScreen
            winners={gameState.gameOver.winners}
            totalScores={gameState.gameOver.totalScores}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </AnimatePresence>

      {/* Win Message Overlay */}
      <AnimatePresence>
        {gameState.winMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: 'backOut' }}
              className="bg-slate-900 border-2 border-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.6)] rounded-3xl p-10 max-w-xl w-full mx-4 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-600 bg-clip-text text-transparent leading-tight drop-shadow-lg"
              >
                {gameState.winMessage}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between mb-3 md:mb-4 px-3 md:px-5 py-2.5 md:py-3 bg-slate-900 rounded-xl border border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap">
            Semantix.io
          </h1>
          <div className="hidden sm:block px-3 py-1 bg-slate-800 rounded-md font-mono text-xs md:text-sm text-slate-400">
            <span className="hidden md:inline">Room: </span>
            <span className="text-white font-bold">{roomId}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs md:text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live' : 'Reconnecting...'}
            </span>
          </div>
          <motion.div
            animate={isUrgent ? {
              color: ['#ef4444', '#f87171', '#ef4444'],
              scale: [1, 1.05, 1],
            } : {}}
            transition={isUrgent ? {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            } : {}}
            className={`text-xl md:text-2xl font-mono font-bold ${
              isUrgent ? 'text-red-500' : isPaused ? 'text-slate-500' : 'text-slate-200'
            }`}
          >
            {minutes}:{seconds}
          </motion.div>
        </div>
      </header>

      {/* Hint Display */}
      <AnimatePresence>
        {gameState.hint && !gameState.winMessage && !gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center mb-3 md:mb-4 shrink-0"
          >
            <div className="px-5 py-2.5 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center gap-4">
              <span className="text-slate-500 font-medium uppercase text-xs tracking-widest hidden sm:inline">Target</span>
              <span className="text-xl md:text-2xl font-mono tracking-[0.4em] text-white font-bold">{gameState.hint}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area - Mobile: stacked, Desktop: flex */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-6xl mx-auto">
        {/* Leaderboard - hidden on mobile */}
        <div className="hidden md:flex md:flex-col w-64 shrink-0 min-h-0">
          <Leaderboard players={gameState.players} />
        </div>

        {/* Global Feed - always visible, takes most space */}
        <div className="flex-1 min-h-0">
          <GlobalFeed feeds={gameState.globalFeeds} />
        </div>

        {/* Personal Feed - hidden on mobile */}
        <div className="hidden md:flex md:flex-col w-64 shrink-0 min-h-0">
          <PersonalFeed feeds={gameState.personalFeeds} />
        </div>
      </main>

      {/* Mobile: Bottom leaderboard ticker (compact) */}
      <div className="md:hidden mt-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
          {Object.values(gameState.players)
            .sort((a, b) => b.score - a.score)
            .map((player, i) => (
              <div
                key={player.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  i === 0
                    ? 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-300'
                    : 'bg-slate-800/50 border border-slate-700/30 text-slate-400'
                }`}
              >
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                <span className="truncate max-w-[80px]">{player.name}</span>
                <span className="font-mono font-bold">{player.score}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom Bar: Input */}
      <footer className="mt-3 md:mt-4 shrink-0 pb-2">
        <div className="bg-slate-900 p-2 md:p-3 rounded-xl border border-slate-800 shadow-xl max-w-3xl mx-auto">
          <GuessInput 
            onGuess={handleGuess} 
            disabled={!isConnected || !!gameState.winMessage} 
            previousGuesses={gameState.personalFeeds.map(f => f.word)}
          />
        </div>
      </footer>
    </div>
  );
}
