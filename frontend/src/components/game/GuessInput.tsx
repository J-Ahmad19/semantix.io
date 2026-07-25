'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

interface GuessInputProps {
  onGuess: (word: string) => void;
  disabled?: boolean;
  previousGuesses?: string[];
}

export function GuessInput({ onGuess, disabled, previousGuesses = [] }: GuessInputProps) {
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();

  const focusInput = useCallback(() => {
    // Small delay ensures it happens after React renders and clears disabled state
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  }, []);

  // Ensure focus is kept after un-disabling (like after round transition)
  useEffect(() => {
    if (!disabled) {
      focusInput();
    }
  }, [disabled, focusInput]);

  // Keep focus if window is active
  useEffect(() => {
    const handleGlobalClick = () => {
      if (!disabled && inputRef.current && document.activeElement !== inputRef.current) {
        // Only force focus if they clicked somewhere that isn't another input/button
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'button') {
           focusInput();
        }
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [disabled, focusInput]);


  const triggerShake = async () => {
    await controls.start({
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4, ease: 'easeInOut' },
    });
    focusInput();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = guess.trim().toLowerCase();
    
    if (disabled) return;

    if (!trimmed) {
      await triggerShake();
      setGuess('');
      return;
    }

    if (previousGuesses.includes(trimmed)) {
      await triggerShake();
      setGuess('');
      return;
    }

    onGuess(trimmed);
    setGuess('');
    focusInput();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full gap-3">
      <motion.div className="flex-1" animate={controls}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type a related word..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 text-base h-12 bg-slate-800/80 border-slate-700 focus-visible:ring-blue-500 focus-visible:ring-2 placeholder:text-slate-500 transition-colors"
        />
      </motion.div>
      <Button
        type="submit"
        disabled={disabled || !guess.trim()}
        className="h-12 px-6 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20 font-bold tracking-wide"
      >
        <SendHorizonal className="w-5 h-5 mr-2" />
        Guess
      </Button>
    </form>
  );
}
