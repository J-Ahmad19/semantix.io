// Helper to safely get the AudioContext
function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  } catch (e) {
    console.error("Audio playback failed", e);
    return null;
  }
}

// 1. Existing Match Sound (100% Guess) - Fast sweep up
export const playMatchSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
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
};

// 2. Start Game Sound - Rapid Arpeggio / Power Up
export const playStartGameSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'square';
  // Arpeggio notes: C4, E4, G4, C5
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
  const stepLength = 0.08;
  
  osc.frequency.setValueAtTime(notes[0], ctx.currentTime);
  notes.forEach((freq, i) => {
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * stepLength);
  });
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime + (notes.length * stepLength) - 0.1);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + (notes.length * stepLength));
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + notes.length * stepLength);
};

// 3. Game Over Sound - Triumphant Fanfare
export const playGameOverSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Triumphant arpeggio: C5, E5, G5, C6 (held)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  const stepLength = 0.12;
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    const startTime = ctx.currentTime + (i * stepLength);
    // If it's the last note, hold it longer
    const duration = (i === notes.length - 1) ? 1.5 : stepLength;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
};

// 4. Hot Guess Sound - Quick positive blip
export const playHotGuessSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

// 5. Cold Guess Sound - Low thud
export const playColdGuessSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

// 6. Round End Sound - Soothing major chord chime
export const playRoundEndSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // A soothing major chord (C4, E4, G4, C5)
  const notes = [261.63, 329.63, 392.00, 523.25];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Slow fade in and fade out for a soothing chime effect
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    // Stagger the attack of each note slightly
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5 + i * 0.2);
    // Very slow release
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.0 + i * 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 4.0);
  });
};
