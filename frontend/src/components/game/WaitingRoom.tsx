import React from 'react';
import { Player } from '@/types/game';

interface WaitingRoomProps {
  roomId: string;
  players: Record<string, Player>;
  host: string;
  currentPlayer: string;
  onStartGame: () => void;
}

export function WaitingRoom({ roomId, players, host, currentPlayer, onStartGame }: WaitingRoomProps) {
  const playerList = Object.values(players);
  const isHost = currentPlayer === host;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0a0a] text-white p-6">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-8 max-w-2xl w-full text-center">
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Waiting Room
        </h2>
        
        <div className="mb-8 inline-block bg-slate-800 border border-indigo-500/30 rounded-xl px-6 py-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <span className="text-slate-400 mr-4 font-medium uppercase text-sm tracking-widest">Room Code</span>
          <span className="text-3xl font-mono tracking-widest text-white font-bold">{roomId}</span>
        </div>
        
        <p className="text-slate-400 mb-8">
          Waiting for the host to start the game. Maximum 7 players.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-left">
          {playerList.map((player) => (
            <div key={player.name} className="flex items-center space-x-3 bg-slate-800 p-3 rounded-xl border border-slate-700/50">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-glow" />
              <span className="font-medium text-slate-200 truncate">
                {player.name} {player.name === host && <span className="text-xs ml-1 text-indigo-400 font-bold">(HOST)</span>}
              </span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 7 - playerList.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center justify-center space-x-3 bg-slate-800/30 p-3 rounded-xl border border-dashed border-slate-700/50">
              <span className="text-slate-600 text-sm italic">Empty Slot</span>
            </div>
          ))}
        </div>
        
        {isHost ? (
          <button 
            onClick={onStartGame}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            Start Game
          </button>
        ) : (
          <div className="w-full py-4 bg-slate-800 text-slate-400 font-bold rounded-xl border border-slate-700">
            Waiting for {host} to start...
          </div>
        )}
      </div>
    </div>
  );
}
