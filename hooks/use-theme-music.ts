import { useCallback, useEffect, useRef, useState } from "react";
import { THEME_MELODIES } from "@/lib/theme-melodies";
import type { ThemeKey } from "@/lib/themes";

export function useThemeMusic(themeKey: ThemeKey) {
  const [isMuted, setIsMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdxRef = useRef(0);
  const nextTimeRef = useRef(0);
  const themeKeyRef = useRef(themeKey);
  themeKeyRef.current = themeKey;
  const scheduleLoopRef = useRef<() => void>(() => {});

  const scheduleLoop = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const mel = THEME_MELODIES[themeKeyRef.current];
    const beatDur = 60 / mel.bpm;

    while (nextTimeRef.current < ctx.currentTime + 0.15) {
      const freq = mel.notes[noteIdxRef.current % mel.notes.length]!;
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(master);
        osc.type = mel.waveform;
        osc.frequency.value = freq;
        const t = nextTimeRef.current;
        const end = t + beatDur * 0.78;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(mel.gain, t + 0.012);
        g.gain.setValueAtTime(mel.gain, end - 0.02);
        g.gain.linearRampToValueAtTime(0, end);
        osc.start(t);
        osc.stop(end + 0.01);
      }
      nextTimeRef.current += beatDur;
      noteIdxRef.current++;
    }

    timerRef.current = setTimeout(() => scheduleLoopRef.current(), 25);
  }, []);
  scheduleLoopRef.current = scheduleLoop;

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const Ctx =
      window.AudioContext ||
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!Ctx) return;
    ctxRef.current = new Ctx();
    masterGainRef.current = ctxRef.current.createGain();
    masterGainRef.current.gain.value = 1;
    masterGainRef.current.connect(ctxRef.current.destination);
    nextTimeRef.current = ctxRef.current.currentTime + 0.05;
    scheduleLoop();
  }, [scheduleLoop]);

  const toggle = useCallback(() => {
    setIsMuted((prev) => {
      const nowMuted = !prev;
      if (masterGainRef.current && ctxRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          nowMuted ? 0 : 1,
          ctxRef.current.currentTime,
          0.05,
        );
      }
      return nowMuted;
    });
  }, []);

  const playStinger = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const mel = THEME_MELODIES[themeKeyRef.current];
    const root = mel.notes.find((f) => f > 0) ?? 440;
    // Major triad (root, major third, perfect fifth), one octave up so it
    // cuts through whatever ambient melody is already playing.
    const intervals = [1, 5 / 4, 3 / 2];
    const startTime = ctx.currentTime + 0.02;
    const noteDur = 0.12;

    intervals.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(master);
      osc.type = mel.waveform;
      osc.frequency.value = root * ratio * 2;
      const t = startTime + i * noteDur * 0.85;
      const end = t + noteDur;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.linearRampToValueAtTime(0, end);
      osc.start(t);
      osc.stop(end + 0.01);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return { start, toggle, isMuted, playStinger };
}
