export const THEMES = {
  soft: {
    label: "✨ Soft & Elegant",
    page: {
      bg: "bg-pink-200",
      pattern: "bg-pixel-check",
      accent: "bg-pink-300",
    },
    machine: {
      frame: "border-pink-400 bg-pink-300",
      interior: "bg-gradient-to-b from-pink-100 to-rose-100",
      rail: "bg-pink-400",
      floor: "bg-pink-300",
      controlPanel: "bg-pink-400",
    },
    claw: {
      rod: "bg-pink-400",
      fingers: "bg-pink-500",
    },
    prize: {
      box: "border-pink-400 bg-pink-200",
      emoji: "🎀",
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
      move: "bg-pink-500 text-white",
      grab: "bg-rose-500 text-white",
    },
  },

  bold: {
    label: "🔥 Bold & Cool",
    page: {
      bg: "bg-slate-900",
      pattern: "bg-pixel-stars",
      accent: "bg-blue-900",
    },
    machine: {
      frame: "border-blue-500 bg-slate-700",
      interior: "bg-gradient-to-b from-slate-800 to-blue-900",
      rail: "bg-slate-500",
      floor: "bg-slate-600",
      controlPanel: "bg-blue-600",
    },
    claw: {
      rod: "bg-slate-400",
      fingers: "bg-blue-400",
    },
    prize: {
      box: "border-blue-400 bg-blue-900",
      emoji: "📦",
      poof: "text-blue-400",
    },
    reveal: {
      bg: "bg-blue-600",
      title: "text-white",
      subtitle: "text-blue-200",
      badge: "text-blue-100",
      button: "bg-white text-blue-600",
    },
    controls: {
      move: "bg-blue-700 text-white",
      grab: "bg-sky-500 text-white",
    },
  },

  cute: {
    label: "🧸 Cute & Playful",
    page: {
      bg: "bg-purple-200",
      pattern: "bg-pixel-check",
      accent: "bg-purple-300",
    },
    machine: {
      frame: "border-purple-400 bg-purple-300",
      interior: "bg-gradient-to-b from-purple-100 to-fuchsia-100",
      rail: "bg-purple-400",
      floor: "bg-purple-300",
      controlPanel: "bg-purple-400",
    },
    claw: {
      rod: "bg-purple-300",
      fingers: "bg-purple-400",
    },
    prize: {
      box: "border-purple-300 bg-purple-100",
      emoji: "🧸",
      poof: "text-fuchsia-400",
    },
    reveal: {
      bg: "bg-purple-400",
      title: "text-white",
      subtitle: "text-purple-100",
      badge: "text-purple-900",
      button: "bg-white text-purple-600",
    },
    controls: {
      move: "bg-purple-500 text-white",
      grab: "bg-fuchsia-500 text-white",
    },
  },

  classic: {
    label: "🎪 Classic Arcade",
    page: {
      bg: "bg-gray-900",
      pattern: "bg-pixel-grid",
      accent: "bg-gray-800",
    },
    machine: {
      frame: "border-yellow-500 bg-gray-700",
      interior: "bg-gradient-to-b from-sky-200 to-sky-100",
      rail: "bg-gray-500",
      floor: "bg-yellow-300",
      controlPanel: "bg-yellow-500",
    },
    claw: {
      rod: "bg-gray-400",
      fingers: "bg-gray-500",
    },
    prize: {
      box: "border-red-400 bg-red-100",
      emoji: "🎁",
      poof: "text-yellow-400",
    },
    reveal: {
      bg: "bg-yellow-500",
      title: "text-white",
      subtitle: "text-yellow-100",
      badge: "text-yellow-900",
      button: "bg-white text-yellow-600",
    },
    controls: {
      move: "bg-red-500 text-white",
      grab: "bg-green-500 text-white",
    },
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = (typeof THEMES)[ThemeKey];
