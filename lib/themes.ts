export const THEMES = {
  soft: {
    label: "✨ Soft & Elegant",
    isDark: false,
    page: {
      bg: "bg-pink-100",
      pattern: "bg-pixel-check",
    },
    text: {
      primary: "text-gray-900", // ← gelap untuk bg terang
      secondary: "text-gray-500",
      accent: "text-pink-600",
    },
    machine: {
      frame: "bg-pink-400 border-pink-600",
      neon: "neon-pink", // ← class CSS kita buat di globals
      interior: "bg-gradient-to-b from-pink-50 via-white to-rose-100",
      rail: "bg-pink-300",
      floor: "bg-pink-300",
      controlPanel: "bg-pink-500",
    },
    claw: {
      rod: "bg-pink-300",
      fingers: "bg-pink-400",
    },
    prize: {
      box: "border-pink-400 bg-pink-50",
      emoji: "🎀",
      altEmojis: ["🎀", "💝", "🌸", "🎁", "💕"],
      poof: "text-pink-400",
    },
    reveal: {
      bg: "bg-pink-400",
      title: "text-white",
      subtitle: "text-pink-100",
      badge: "text-pink-900",
      button: "bg-white text-pink-600",
    },
    controls: {
      move: "bg-pink-500 text-white hover:bg-pink-400",
      grab: "bg-rose-500 text-white hover:bg-rose-400",
    },
  },

  bold: {
    label: "🔥 Bold & Cool",
    isDark: true,
    page: {
      bg: "bg-slate-950",
      pattern: "bg-pixel-stars",
    },
    text: {
      primary: "text-white", // ← terang untuk bg gelap
      secondary: "text-slate-400",
      accent: "text-cyan-400",
    },
    machine: {
      frame: "bg-slate-700 border-cyan-500",
      neon: "neon-cyan",
      interior: "bg-gradient-to-b from-slate-900 via-slate-800 to-blue-950",
      rail: "bg-slate-500",
      floor: "bg-slate-700",
      controlPanel: "bg-cyan-600",
    },
    claw: {
      rod: "bg-slate-300",
      fingers: "bg-cyan-400",
    },
    prize: {
      box: "border-cyan-500 bg-slate-800",
      emoji: "📦",
      altEmojis: ["📦", "⚡", "🎯", "💎", "🔮"],
      poof: "text-cyan-400",
    },
    reveal: {
      bg: "bg-cyan-600",
      title: "text-white",
      subtitle: "text-cyan-100",
      badge: "text-cyan-900",
      button: "bg-white text-cyan-700",
    },
    controls: {
      move: "bg-slate-700 text-white hover:bg-slate-600 border border-cyan-500",
      grab: "bg-cyan-500 text-white hover:bg-cyan-400",
    },
  },

  cute: {
    label: "🧸 Cute & Playful",
    isDark: false,
    page: {
      bg: "bg-purple-100",
      pattern: "bg-pixel-check",
    },
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-500",
      accent: "text-purple-600",
    },
    machine: {
      frame: "bg-purple-400 border-purple-600",
      neon: "neon-purple",
      interior: "bg-gradient-to-b from-purple-50 via-fuchsia-50 to-pink-100",
      rail: "bg-purple-300",
      floor: "bg-purple-300",
      controlPanel: "bg-purple-500",
    },
    claw: {
      rod: "bg-purple-300",
      fingers: "bg-purple-400",
    },
    prize: {
      box: "border-purple-400 bg-purple-50",
      emoji: "🧸",
      altEmojis: ["🧸", "🍭", "🌈", "🦄", "🎠"],
      poof: "text-fuchsia-400",
    },
    reveal: {
      bg: "bg-purple-500",
      title: "text-white",
      subtitle: "text-purple-100",
      badge: "text-purple-900",
      button: "bg-white text-purple-600",
    },
    controls: {
      move: "bg-purple-500 text-white hover:bg-purple-400",
      grab: "bg-fuchsia-500 text-white hover:bg-fuchsia-400",
    },
  },

  classic: {
    label: "🎪 Classic Arcade",
    isDark: true,
    page: {
      bg: "bg-gray-950",
      pattern: "bg-pixel-grid",
    },
    text: {
      primary: "text-yellow-400", // ← FIX: kuning di background hitam
      secondary: "text-gray-400",
      accent: "text-yellow-300",
    },
    machine: {
      frame: "bg-gray-800 border-yellow-400",
      neon: "neon-yellow",
      interior: "bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100",
      rail: "bg-gray-500",
      floor: "bg-yellow-400",
      controlPanel: "bg-yellow-500",
    },
    claw: {
      rod: "bg-gray-300",
      fingers: "bg-gray-200",
    },
    prize: {
      box: "border-red-400 bg-red-50",
      emoji: "🎁",
      altEmojis: ["🎁", "🎮", "🕹️", "👾", "🏆"],
      poof: "text-yellow-400",
    },
    reveal: {
      bg: "bg-yellow-500",
      title: "text-gray-900",
      subtitle: "text-yellow-900",
      badge: "text-yellow-950",
      button: "bg-gray-900 text-yellow-400",
    },
    controls: {
      move: "bg-red-500 text-white hover:bg-red-400",
      grab: "bg-green-500 text-white hover:bg-green-400",
    },
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = (typeof THEMES)[ThemeKey];
