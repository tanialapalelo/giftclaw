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
  isLucky = false,
}: {
  gift: GiftSuggestion;
  onReset: () => void;
  onViewPicks: () => void;
  canTryAgain: boolean;
  attemptNumber: number;
  maxAttempts: number;
  theme: Theme;
  isLucky?: boolean;
}) {
  const vibe = getVibeFromGift(gift);

  // Fire confetti on reveal
  useEffect(() => {
    if (isLucky) {
      // Golden burst for lucky grab
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#facc15", "#fbbf24", "#f59e0b", "#fcd34d", "#ffffff"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.4 },
          angle: 60,
          colors: ["#facc15", "#fbbf24", "#ff6b6b"],
        });
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.4 },
          angle: 120,
          colors: ["#facc15", "#fbbf24", "#60a5fa"],
        });
      }, 300);
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#facc15", "#f472b6", "#34d399", "#60a5fa", "#c084fc"],
      });
    }
  }, []);

  return (
    <div className="animate-slot-reveal">
      {/* Zigzag top edge — ticket/receipt feel (uses same bg as reveal panel) */}
      <div
        className={`h-3 w-full -mb-px ${theme.reveal.bg}`}
        style={{
          clipPath:
            "polygon(0 0, 4% 100%, 8% 0, 12% 100%, 16% 0, 20% 100%, 24% 0, 28% 100%, 32% 0, 36% 100%, 40% 0, 44% 100%, 48% 0, 52% 100%, 56% 0, 60% 100%, 64% 0, 68% 100%, 72% 0, 76% 100%, 80% 0, 84% 100%, 88% 0, 92% 100%, 96% 0, 100% 100%, 100% 0)",
        }}
      />
      <div
        className={`p-6 text-center space-y-4 rounded-lg ${theme.reveal.bg}`}
      >
        {/* Lucky grab banner */}
        {isLucky && (
          <div className="animate-bounce-in flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-1.5 mx-auto w-fit">
            <span className="text-base">⭐</span>
            <span className="font-pixel text-[8px] text-yellow-900 tracking-widest">
              LUCKY GRAB!
            </span>
            <span className="text-base">⭐</span>
          </div>
        )}

        {/* Attempt counter */}
        <p
          className={`font-pixel text-[7px] tracking-widest ${theme.reveal.subtitle}`}
        >
          ATTEMPT {attemptNumber} / {maxAttempts}
        </p>

        {/* Emoji with sparkle burst */}
        <div className="relative inline-block w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center">
            {["★", "✦", "◆", "✦", "★"].map((s, i) => (
              <span
                key={i}
                className={`absolute font-pixel text-[10px] animate-blink opacity-70 ${theme.reveal.subtitle}`}
                style={{
                  transform: `rotate(${i * 72}deg) translateY(-40px)`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce-in">
            {vibe.emoji}
          </div>
        </div>

        <div className="space-y-2">
          <p
            className={`font-pixel text-[8px] uppercase tracking-widest ${theme.reveal.subtitle}`}
          >
            🔍 YOUR CLUE
          </p>
          <p
            className={`font-body text-sm leading-relaxed max-w-xs mx-auto ${theme.reveal.title}`}
          >
            &ldquo;{vibe.tagline}&rdquo;
          </p>
          <p
            className={`font-pixel text-[7px] ${theme.reveal.subtitle} opacity-60`}
          >
            see all your gifts after final grab
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
    </div>
  );
}
