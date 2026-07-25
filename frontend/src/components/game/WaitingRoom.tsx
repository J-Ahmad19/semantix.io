import React from 'react';
import { Player } from '@/types/game';
import { playStartGameSound } from '@/lib/sounds';

interface WaitingRoomProps {
  roomId: string;
  players: Record<string, Player>;
  host: string;
  currentPlayer: string;
  onStartGame: () => void;
  settings: { rounds: number; time: number };
  onUpdateSettings: (rounds: number, time: number) => void;
}

export function WaitingRoom({ roomId, players, host, currentPlayer, onStartGame, settings, onUpdateSettings }: WaitingRoomProps) {
  const playerList = Object.values(players);
  const isHost = currentPlayer === host;

  const handleStartClick = () => {
    playStartGameSound();
    onStartGame();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-game-bg text-white p-6 overflow-y-auto">
      <div className="bg-game-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 max-w-2xl w-full text-center my-auto">
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-game-cold drop-shadow-md tracking-tighter uppercase">
          Waiting Room
        </h2>
        
        <div className="mb-6 inline-block bg-game-bg border-4 border-black rounded-2xl px-6 py-3 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)]">
          <span className="text-game-warm mr-4 font-sans font-bold uppercase text-lg tracking-widest">Room Code</span>
          <span className="text-3xl font-mono tracking-widest text-white font-bold">{roomId}</span>
        </div>
        
        {/* Game Settings Panel */}
        <div className="mb-6 bg-slate-800 border-4 border-black rounded-2xl p-4 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold uppercase text-sm tracking-widest text-slate-300">Rounds:</span>
            <select 
              value={settings.rounds}
              onChange={(e) => onUpdateSettings(parseInt(e.target.value), settings.time)}
              disabled={!isHost}
              className="bg-game-bg border-2 border-black rounded-lg px-3 py-1 font-mono font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed outline-none focus:border-game-match cursor-pointer"
            >
              {[1, 3, 5, 7, 10].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold uppercase text-sm tracking-widest text-slate-300">Time:</span>
            <select 
              value={settings.time}
              onChange={(e) => onUpdateSettings(settings.rounds, parseInt(e.target.value))}
              disabled={!isHost}
              className="bg-game-bg border-2 border-black rounded-lg px-3 py-1 font-mono font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed outline-none focus:border-game-match cursor-pointer"
            >
              {[30, 45, 60, 90, 120].map(t => <option key={t} value={t}>{t}s</option>)}
            </select>
          </div>
        </div>
        
        <p className="text-slate-400 mb-6 font-sans">
          Waiting for the host to start the game. Maximum 7 players.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-left font-sans">
          {playerList.map((player) => (
            <div key={player.name} className="flex items-center space-x-3 bg-game-bg p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-3 h-3 rounded-full bg-game-match border-2 border-black" />
              <span className="font-bold text-slate-100 truncate text-lg">
                {player.name} {player.name === host && <span className="text-xs ml-1 text-game-hot font-bold">(HOST)</span>}
              </span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 7 - playerList.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center justify-center space-x-3 bg-game-bg/50 p-3 rounded-xl border-2 border-dashed border-black/50">
              <span className="text-slate-500 text-sm italic font-bold">Empty Slot</span>
            </div>
          ))}
        </div>
        
        {isHost ? (
          <button 
            onClick={handleStartClick}
            className="w-full py-4 bg-game-cold text-game-bg font-display font-bold uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all tracking-widest hover:bg-game-match hover:text-black"
          >
            Start Game
          </button>
        ) : (
          <div className="w-full py-4 bg-game-bg text-slate-400 font-sans font-bold rounded-xl border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            Waiting for {host} to start...
          </div>
        )}
      </div>
    </div>
  );
}
