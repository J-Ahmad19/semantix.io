import { useState, useCallback } from 'react';
import { GameEvent, Player, GuessResult } from '../types/game';
const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export function useGameState() {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [globalFeeds, setGlobalFeeds] = useState<GuessResult[]>([]);
  const [personalFeeds, setPersonalFeeds] = useState<GuessResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<{ winners: string[], totalScores: Record<string, number> } | null>(null);
  const [hint, setHint] = useState<string>("");
  const [host, setHost] = useState<string>("");
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const handleEvent = useCallback((event: GameEvent, currentPlayerName: string) => {
    switch (event.type) {
      case 'SYNC':
        setPlayers(prev => {
          const next = { ...prev };
          event.players.forEach(p => {
            if (!next[p]) {
              next[p] = { name: p, score: 0, active: true };
            } else {
              next[p].active = true;
            }
          });
          return next;
        });
        setHost(event.host);
        setGameStarted(event.game_started);
        setGameOver(null);
        setWinMessage(null);
        break;

      case 'JOIN':
        setPlayers(prev => ({
          ...prev,
          [event.player]: { name: event.player, score: prev[event.player]?.score || 0, active: true }
        }));
        break;
      
      case 'LEAVE':
        setPlayers(prev => {
          const next = { ...prev };
          if (next[event.player]) {
            next[event.player].active = false;
          }
          return next;
        });
        break;

      case 'GUESS_RESULT':
        const result: GuessResult = {
          player: event.player,
          word: event.word,
          score: event.score,
          timestamp: Date.now()
        };
        
        // Add to global feed if score >= 50
        if (event.score >= 50) {
          setGlobalFeeds(prev => [result, ...prev]);
        }

        // Play sound if 100%
        if (event.score === 100) {
          playSuccessSound();
        }

        // Add to personal feed if it's the current player
        if (event.player === currentPlayerName) {
          setPersonalFeeds(prev => [result, ...prev]);
        }
        break;

      case 'ROUND_WIN':
        setWinMessage(`${event.player} won the round with the word "${event.word}"!`);
        break;

      case 'ROUND_END':
        setWinMessage(`Round Over! The target word was "${event.word}". Next round starts in 10s.`);
        setPlayers(prev => {
          const next = { ...prev };
          Object.entries(event.total_scores).forEach(([player, score]) => {
            if (next[player]) {
              next[player].score = score;
            }
          });
          return next;
        });
        // Clear feeds for the next round
        setTimeout(() => {
          setGlobalFeeds([]);
          setPersonalFeeds([]);
          setWinMessage(null);
        }, 9000); // Clear just before next round starts
        break;

      case 'GAME_OVER':
        setGameOver({ winners: event.winners, totalScores: event.total_scores });
        setPlayers(prev => {
          const next = { ...prev };
          Object.entries(event.total_scores).forEach(([player, score]) => {
            if (next[player]) {
              next[player].score = score;
            }
          });
          return next;
        });
        break;

      case 'TIMER_TICK':
        setTimeLeft(event.seconds_left);
        if (event.hint) {
          setHint(event.hint);
        }
        break;
    }
  }, []);

  return {
    players,
    globalFeeds,
    personalFeeds,
    timeLeft,
    winMessage,
    gameOver,
    hint,
    host,
    gameStarted,
    handleEvent
  };
}
