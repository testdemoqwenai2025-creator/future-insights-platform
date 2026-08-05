'use client';

import { useCallback, useRef } from 'react';

type SoundType = 
  | 'click' 
  | 'hover' 
  | 'open' 
  | 'close' 
  | 'success' 
  | 'error' 
  | 'whoosh' 
  | 'pop' 
  | 'sparkle' 
  | 'transition'
  | 'notification'
  | 'typing';

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType, volume: number = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      switch (type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
          break;

        case 'hover':
          oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.03);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.05);
          break;

        case 'open':
          oscillator.frequency.setValueAtTime(300, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
          oscillator.type = 'sine';
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.2);
          break;

        case 'close':
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
          oscillator.type = 'sine';
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.2);
          break;

        case 'success':
          oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
          oscillator.type = 'sine';
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
          
          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(659, ctx.currentTime); // E5
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.15);
          }, 100);
          
          setTimeout(() => {
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.frequency.setValueAtTime(784, ctx.currentTime); // G5
            osc3.type = 'sine';
            gain3.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc3.start(ctx.currentTime);
            osc3.stop(ctx.currentTime + 0.2);
          }, 200);
          break;

        case 'error':
          oscillator.frequency.setValueAtTime(200, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
          oscillator.type = 'sawtooth';
          gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.25);
          break;

        case 'whoosh':
          oscillator.frequency.setValueAtTime(400, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.25);
          break;

        case 'pop':
          oscillator.frequency.setValueAtTime(600, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
          break;

        case 'sparkle':
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const spark = ctx.createOscillator();
              const sparkGain = ctx.createGain();
              spark.connect(sparkGain);
              sparkGain.connect(ctx.destination);
              spark.frequency.setValueAtTime(1000 + Math.random() * 2000, ctx.currentTime);
              spark.type = 'sine';
              sparkGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
              sparkGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
              spark.start(ctx.currentTime);
              spark.stop(ctx.currentTime + 0.1);
            }, i * 50);
          }
          return; // Early return to avoid stopping main oscillator

        case 'transition':
          oscillator.frequency.setValueAtTime(400, ctx.currentTime);
          oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
          oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
          oscillator.type = 'triangle';
          gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.25);
          break;

        case 'notification':
          oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);
          
          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(1100, ctx.currentTime); // C#6
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.15);
          }, 150);
          break;

        case 'typing': {
          const baseFreq = 300 + Math.random() * 200;
          oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          oscillator.type = 'square';
          gainNode.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.03);
          break;
        }

        default:
          oscillator.frequency.setValueAtTime(440, ctx.currentTime);
          oscillator.type = 'sine';
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
      }
    } catch (error) {
      // Silently fail if audio is not supported
      console.debug('Sound playback failed:', error);
    }
  }, [getAudioContext]);

  return { playSound };
}
