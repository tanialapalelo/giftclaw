export const THEMES = {
  bold: {
    label: "🔥 Bold & Cool",
    isDark: true,
    page: {
      bg: "bg-slate-950",
      pattern: "bg-pixel-stars",
    },
    text: {
      primary: "text-white", // ← light for dark bg
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
      boxStyle: "default",
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

  soft: {
    label: "✨ Soft & Elegant",
    isDark: true,
    page: {
      bg: "bg-rose-950",
      pattern: "bg-pixel-grid",
    },
    text: {
      primary: "text-rose-50",
      secondary: "text-rose-300",
      accent: "text-amber-300",
    },
    machine: {
      // Dark stone cabinet + gold border = rose gold aesthetic
      frame: "bg-stone-800 border-amber-300",
      neon: "neon-yellow",
      interior: "bg-gradient-to-b from-rose-900 via-rose-800 to-pink-950",
      rail: "bg-stone-500",
      floor: "bg-rose-800",
      controlPanel: "bg-rose-900",
    },
    claw: {
      rod: "bg-amber-300",
      fingers: "bg-pink-400",
    },
    prize: {
      box: "border-amber-400 bg-rose-900",
      boxStyle: "warm",
      emoji: "🎀",
      altEmojis: ["🎀", "💝", "🌸", "🎁", "💕"],
      poof: "text-amber-300",
    },
    reveal: {
      bg: "bg-rose-500",
      title: "text-white",
      subtitle: "text-rose-100",
      badge: "text-rose-950",
      button: "bg-amber-400 text-rose-950",
    },
    controls: {
      move: "bg-rose-800 text-amber-200 hover:bg-rose-700 border border-amber-400",
      grab: "bg-rose-500 text-white hover:bg-rose-400",
    },
  },

  cute: {
    label: "🧸 Cute & Playful",
    isDark: true,
    page: {
      bg: "bg-violet-950",
      pattern: "bg-pixel-stars",
    },
    text: {
      primary: "text-fuchsia-100",
      secondary: "text-fuchsia-300",
      accent: "text-yellow-300",
    },
    machine: {
      // Hot pink cabinet + yellow border = candy machine aesthetic
      frame: "bg-fuchsia-800 border-yellow-300",
      neon: "neon-pink",
      interior:
        "bg-gradient-to-b from-violet-900 via-fuchsia-900 to-purple-950",
      rail: "bg-fuchsia-600",
      floor: "bg-yellow-400",
      controlPanel: "bg-fuchsia-600",
    },
    claw: {
      rod: "bg-fuchsia-300",
      fingers: "bg-purple-500",
    },
    prize: {
      box: "border-yellow-400 bg-violet-900",
      boxStyle: "candy",
      emoji: "🧸",
      altEmojis: ["🧸", "🍭", "🌈", "🦄", "🎠"],
      poof: "text-yellow-300",
    },
    reveal: {
      bg: "bg-fuchsia-500",
      title: "text-white",
      subtitle: "text-fuchsia-100",
      badge: "text-fuchsia-950",
      button: "bg-yellow-300 text-fuchsia-900",
    },
    controls: {
      move: "bg-fuchsia-800 text-yellow-200 hover:bg-fuchsia-700 border border-yellow-300",
      grab: "bg-yellow-400 text-fuchsia-900 hover:bg-yellow-300",
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
      primary: "text-yellow-400",
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
      boxStyle: "default",
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
