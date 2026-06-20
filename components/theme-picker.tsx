"use client";

import { THEMES, type ThemeKey } from "@/lib/themes";
import type { Theme } from "@/lib/themes";

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
        Pick a vibe for their claw machine
      </label>
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(THEMES) as [ThemeKey, Theme][]).map(([key, theme]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-xl border bg-gray-800 p-4 text-center transition-all ${
              value === key
                ? "border-yellow-400 ring-2 ring-yellow-400/30 scale-[1.02]"
                : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <span className="text-2xl">{theme.prize.emoji}</span>
            <p className="mt-1 font-pixel text-[8px] text-gray-300">
              {theme.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
