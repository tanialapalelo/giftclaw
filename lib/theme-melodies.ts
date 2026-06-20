import type { ThemeKey } from "@/lib/themes";

export type MelodyConfig = {
  notes: number[];
  bpm: number;
  waveform: OscillatorType;
  gain: number;
};

// Each theme gets a distinct melodic personality.
// Notes are in Hz. 0 = rest.
export const THEME_MELODIES: Record<ThemeKey, MelodyConfig> = {
  bold: {
    // A minor pentatonic — driving, cyberpunk
    notes: [220, 329.6, 261.6, 440, 293.7, 329.6, 261.6, 392],
    bpm: 138,
    waveform: "square",
    gain: 0.06,
  },
  soft: {
    // C major pentatonic — gentle, romantic waltz
    notes: [523.3, 440, 392, 523.3, 329.6, 392, 440, 261.6],
    bpm: 76,
    waveform: "sine",
    gain: 0.11,
  },
  cute: {
    // C major high octave — bouncy, kawaii
    notes: [523.3, 659.3, 784, 659.3, 523.3, 659.3, 880, 784],
    bpm: 168,
    waveform: "square",
    gain: 0.05,
  },
  classic: {
    // C major — classic 8-bit arcade
    notes: [261.6, 329.6, 392, 261.6, 329.6, 523.3, 392, 261.6],
    bpm: 120,
    waveform: "square",
    gain: 0.07,
  },
};
