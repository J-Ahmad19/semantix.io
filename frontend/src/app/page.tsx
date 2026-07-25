'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    // If no room is provided, generate a random one
    const targetRoom = roomId.trim() || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    router.push(`/room/${targetRoom}?name=${encodeURIComponent(nickname.trim())}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-game-bg text-white p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-game-cold/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-game-hot/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="bg-game-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 max-w-md w-full text-center z-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 text-game-cold drop-shadow-md tracking-tighter uppercase">
          Semantix.io
        </h1>
        <p className="text-slate-400 mb-8 font-sans font-medium text-sm md:text-base">
          Real-time multiplayer semantic word association.
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2 text-left">
            <label htmlFor="nickname" className="block text-game-warm font-sans font-bold uppercase text-sm tracking-widest ml-1">
              Choose a Nickname
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="e.g. WordMaster99"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-game-bg border-4 border-black rounded-xl px-4 py-3 font-sans font-bold text-lg outline-none focus:border-game-match text-white shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)] placeholder:text-slate-600 transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2 text-left">
            <label htmlFor="roomId" className="block text-game-warm font-sans font-bold uppercase text-sm tracking-widest ml-1">
              Lobby Code (Optional)
            </label>
            <input
              id="roomId"
              type="text"
              placeholder="Leave blank to create"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full bg-game-bg border-4 border-black rounded-xl px-4 py-3 font-mono font-bold text-lg uppercase outline-none focus:border-game-match text-white shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.5)] placeholder:text-slate-600 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 py-4 bg-game-cold text-game-bg font-display font-bold uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all tracking-widest hover:bg-game-match hover:text-black"
          >
            {roomId ? 'Join Lobby' : 'Create Lobby'}
          </button>
        </form>
      </div>
    </div>
  );
}
