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
import { Wifi, WifiOff, X, ListOrdered } from 'lucide-react';

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name');
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [wsUrl, setWsUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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
              className="bg-game-surface border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-10 max-w-xl w-full mx-4 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-wider drop-shadow-md">
                  {gameState.winMessage.title}
                </div>
                
                {gameState.winMessage.word && (
                  <div className="text-5xl md:text-6xl font-sans font-black text-game-match drop-shadow-[0_0_15px_rgba(0,255,0,0.5)] tracking-wide bg-black/30 px-8 py-4 rounded-2xl border-4 border-game-match/50">
                    {gameState.winMessage.word.toUpperCase()}
                  </div>
                )}
                
                {gameState.winMessage.subtitle && (
                  <div className="text-xl md:text-2xl font-mono text-game-warm font-bold mt-2 animate-pulse">
                    {gameState.winMessage.subtitle}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden absolute inset-0 z-40 flex flex-col bg-black/90 backdrop-blur-sm p-4 pt-10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Full Leaderboard</h2>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Leaderboard players={gameState.players} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between mb-3 md:mb-4 px-3 md:px-5 py-2.5 md:py-3 bg-game-surface rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <h1 className="text-xl md:text-3xl font-display font-bold text-game-cold drop-shadow-md whitespace-nowrap uppercase tracking-tighter">
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
              scale: [1, 1.05, 1],
            } : { scale: 1 }}
            transition={isUrgent ? {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            } : { duration: 0.3 }}
            className={`text-xl md:text-2xl font-mono font-bold transition-colors ${
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
            <div className="px-5 py-3 bg-game-surface border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 flex-wrap justify-center">
              <span className="text-game-warm font-sans font-bold uppercase text-sm tracking-widest hidden sm:inline shrink-0">Target</span>
              <span className="text-2xl md:text-4xl font-mono tracking-[0.2em] text-white font-bold break-all">{gameState.hint}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex p-1 bg-slate-900 rounded-lg mb-3 shrink-0">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${
            activeTab === 'global' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
          }`}
        >
          Global Feed
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${
            activeTab === 'personal' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
          }`}
        >
          Your Guesses
        </button>
      </div>

      {/* Main Game Area - Mobile: flex, Desktop: flex */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-6xl mx-auto">
        {/* Leaderboard - hidden on mobile */}
        <div className="hidden md:flex md:flex-col w-64 shrink-0 min-h-0">
          <Leaderboard players={gameState.players} />
        </div>

        {/* Global Feed - always visible on desktop, tab-based on mobile */}
        <div className={`flex-1 min-h-0 ${activeTab === 'global' ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
          <GlobalFeed feeds={gameState.globalFeeds} />
        </div>

        {/* Personal Feed - hidden on mobile unless activeTab is personal */}
        <div className={`md:w-64 shrink-0 min-h-0 ${activeTab === 'personal' ? 'flex flex-col flex-1' : 'hidden md:flex md:flex-col'}`}>
          <PersonalFeed feeds={gameState.personalFeeds} />
        </div>
      </main>

      {/* Mobile: Bottom leaderboard ticker (compact) */}
      <div className="md:hidden mt-2 shrink-0">
        <button 
          onClick={() => setShowLeaderboard(true)}
          className="w-full flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide active:opacity-70 transition-opacity"
        >
          <div className="flex items-center justify-center bg-slate-800 rounded-full p-1.5 shrink-0 text-slate-400">
            <ListOrdered className="w-4 h-4" />
          </div>
          {Object.values(gameState.players)
            .sort((a, b) => b.score - a.score)
            .map((player, i) => (
              <div
                key={player.name}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
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
        </button>
      </div>

      {/* Bottom Bar: Input */}
      <footer className="mt-3 md:mt-4 shrink-0 pb-2">
        <div className="bg-game-surface p-2 md:p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-3xl mx-auto">
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
