import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const audioFiles = import.meta.glob('/src/assets/audio/*.{mp3,ogg,wav,opus,webm,m4a,aac}', { eager: true });
const bgmUrl = Object.values(audioFiles)[0]?.default || null;

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

export function playTypeBlip(frequency = 620, volume = 0.04) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  } catch {
    /* ignore */
  }
}

export function playBubble(volume = 0.12) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.18);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch {
    /* ignore */
  }
}

export function playCorrect(volume = 0.08) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const start = t + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.38);
    });
  } catch {
    /* ignore */
  }
}

export function playReveal(volume = 0.12) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1567.98, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.95);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3135.96, t + 0.01);
    gain2.gain.setValueAtTime(0.0001, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(volume * 0.4, t + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.01);
    osc2.stop(t + 0.6);
  } catch {
    /* ignore */
  }
}

export function playWrong(volume = 0.18) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(392, t);
    osc.frequency.linearRampToValueAtTime(370, t + 0.18);
    osc.frequency.linearRampToValueAtTime(349, t + 0.36);
    osc.frequency.linearRampToValueAtTime(330, t + 0.54);
    osc.frequency.linearRampToValueAtTime(311, t + 0.72);
    osc.frequency.linearRampToValueAtTime(294, t + 0.9);
    osc.frequency.linearRampToValueAtTime(277, t + 1.08);
    osc.frequency.linearRampToValueAtTime(262, t + 1.26);
    osc.frequency.linearRampToValueAtTime(233, t + 1.5);
    osc.frequency.linearRampToValueAtTime(196, t + 1.8);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.05);
    gain.gain.setValueAtTime(volume, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(volume * 0.4, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(volume * 0.4, t + 0.65);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 2);
  } catch {
    /* ignore */
  }
}

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const { user } = useAuth();
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(() => {
    const stored = localStorage.getItem('cv_music');
    return stored === null ? true : stored === '1';
  });

  const musicOnRef = useRef(musicOn);
  const roleRef = useRef(user?.role);
  useEffect(() => {
    musicOnRef.current = musicOn;
  }, [musicOn]);
  useEffect(() => {
    roleRef.current = user?.role;
  }, [user?.role]);

  useEffect(() => {
    localStorage.setItem('cv_music', musicOn ? '1' : '0');
  }, [musicOn]);

  const tryStart = useCallback(() => {
    const el = audioRef.current;
    if (!el || !bgmUrl) return;
    getCtx()?.resume();
    if (musicOnRef.current && roleRef.current === 'student' && el.paused) {
      el.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.addEventListener('pointerdown', tryStart);
    document.addEventListener('keydown', tryStart);
    return () => {
      document.removeEventListener('pointerdown', tryStart);
      document.removeEventListener('keydown', tryStart);
    };
  }, [tryStart]);

  const startMusic = useCallback(() => {
    const el = audioRef.current;
    if (!el || !bgmUrl) return;
    if (musicOnRef.current) el.play().catch(() => {});
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicOn((prev) => {
      const next = !prev;
      const el = audioRef.current;
      if (el && bgmUrl) {
        if (next) el.play().catch(() => {});
        else el.pause();
      }
      return next;
    });
  }, []);

  const stopMusic = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const value = useMemo(
    () => ({ musicOn, toggleMusic, startMusic, stopMusic, musicAvailable: Boolean(bgmUrl) }),
    [musicOn, toggleMusic, startMusic, stopMusic]
  );

  return (
    <AudioContext.Provider value={value}>
      {bgmUrl && <audio ref={audioRef} src={bgmUrl} loop preload="none" />}
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
