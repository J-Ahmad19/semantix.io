'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50 mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50 mix-blend-screen" />
      </div>

      <Card className="w-full max-w-md z-10 bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Semantix
            </span>
            .io
          </CardTitle>
          <p className="text-slate-400 mt-2 text-sm">
            Real-time multiplayer semantic word association.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-slate-300 ml-1">
                Choose a Nickname
              </label>
              <Input
                id="nickname"
                placeholder="e.g. WordMaster99"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-12 text-lg bg-slate-950/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="roomId" className="text-sm font-medium text-slate-300 ml-1">
                Lobby Code (Optional)
              </label>
              <Input
                id="roomId"
                placeholder="Leave blank to create new"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="h-12 text-lg font-mono uppercase bg-slate-950/50"
                maxLength={6}
              />
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
              {roomId ? (
                <><Users className="w-5 h-5 mr-2" /> Join Lobby</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Create Lobby</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
