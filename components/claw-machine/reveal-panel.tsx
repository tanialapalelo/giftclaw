"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";
import { getVibeFromGift } from "@/lib/vibe";

export function RevealPanel({
  gift,
  onReset,
  onViewPicks,
  canTryAgain,
  attemptNumber,
  maxAttempts,
  theme,
}: {
  gift: GiftSuggestion;
  onReset: () => void;
  onViewPicks: () => void;
  canTryAgain: boolean; // false if already attempt three times
  attemptNumber: number; // 1, 2, or 3
  maxAttempts: number; // 3
  theme: Theme;
}) {
  const vibe = getVibeFromGift(gift);

  // Fire confetti on reveal
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#facc15", "#f472b6", "#34d399", "#60a5fa", "#c084fc"],
    });
  }, []);

  return (
    <div
      className={`animate-fade-in p-6 text-center space-y-4 rounded-lg ${theme.reveal.bg}`}
    >
      {/* Attempt counter */}
      <p
        className={`font-pixel text-[7px] tracking-widest ${theme.reveal.subtitle}`}
      >
        ATTEMPT {attemptNumber} / {maxAttempts}
      </p>

      <div className="text-6xl animate-float">{vibe.emoji}</div>

      <div className="space-y-2">
        <p
          className={`font-pixel text-[8px] uppercase tracking-widest ${theme.reveal.subtitle}`}
        >
          YOUR GIFT VIBE
        </p>
        <p
          className={`font-body text-sm leading-relaxed max-w-xs mx-auto ${theme.reveal.title}`}
        >
          "{vibe.tagline}"
        </p>
      </div>

      {/* Mood tags */}
      <div className="flex items-center justify-center gap-2">
        {vibe.moodTags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-3 py-1 font-body text-xs bg-black/10 ${theme.reveal.badge}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {canTryAgain && (
          <button
            onClick={onReset}
            className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform bg-black/20 ${theme.reveal.title}`}
          >
            ↻ TRY AGAIN
          </button>
        )}
        <button
          onClick={onViewPicks}
          className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform ${theme.reveal.button}`}
        >
          {canTryAgain ? "★ SEE MY VIBES" : "★ SEE ALL VIBES"}
        </button>
      </div>
    </div>
  );
}
