import { useState, useCallback } from 'react';
import { GameEvent, Player, GuessResult } from '../types/game';
import { playMatchSound, playHotGuessSound, playColdGuessSound, playGameOverSound, playRoundEndSound } from '../lib/sounds';

export interface WinMessageData {
  title: string;
  word?: string;
  subtitle?: string;
}

export function useGameState() {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [globalFeeds, setGlobalFeeds] = useState<GuessResult[]>([]);
  const [personalFeeds, setPersonalFeeds] = useState<GuessResult[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [winMessage, setWinMessage] = useState<WinMessageData | null>(null);
  const [gameOver, setGameOver] = useState<{ winners: string[], totalScores: Record<string, number> } | null>(null);
  const [hint, setHint] = useState<string>("");
  const [host, setHost] = useState<string>("");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [settings, setSettings] = useState<{rounds: number, time: number}>({ rounds: 3, time: 60 });

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
              if (!event.game_started) {
                next[p].score = 0;
              }
            }
          });
          return next;
        });
        setHost(event.host);
        setGameStarted(event.game_started);
        if (event.settings) {
          setSettings(event.settings);
        }
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

        // Add to personal feed if it's the current player, and play sounds
        if (event.player === currentPlayerName) {
          setPersonalFeeds(prev => [result, ...prev]);
          if (event.score === 100) {
            playMatchSound();
          } else if (event.score >= 50) {
            playHotGuessSound();
          } else {
            playColdGuessSound();
          }
        }
        break;

      case 'ROUND_WIN':
        setWinMessage({
          title: `${event.player} won the round!`,
          word: event.word
        });
        break;

      case 'ROUND_END':
        if (!event.is_last_round) {
          playRoundEndSound();
          setWinMessage({
            title: "Round Over!",
            word: event.word,
            subtitle: "Next round starts in 10s..."
          });
        }
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
        if (!event.is_last_round) {
          setTimeout(() => {
            setGlobalFeeds([]);
            setPersonalFeeds([]);
            setWinMessage(null);
          }, 9000); // Clear just before next round starts
        }
        break;

      case 'GAME_OVER':
        playGameOverSound();
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
    settings,
    handleEvent
  };
}
