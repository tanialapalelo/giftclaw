"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";
import { getVibeFromGift } from "@/lib/vibe";

export function RevealPanel({
  gift,
  onResetAction,
  onViewPicksAction,
  canTryAgain,
  attemptNumber,
  maxAttempts,
  theme,
  isLucky = false,
  playStinger,
}: {
  gift: GiftSuggestion;
  onResetAction: () => void;
  onViewPicksAction: () => void;
  canTryAgain: boolean;
  attemptNumber: number;
  maxAttempts: number;
  theme: Theme;
  isLucky?: boolean;
  playStinger?: () => void;
}) {
  const vibe = getVibeFromGift(gift);

  // Fire the reveal stinger + confetti once, on mount
  useEffect(() => {
    playStinger?.();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLucky]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-modal-backdrop-fade">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm animate-modal-pop"
      >
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
            <div
              className="animate-bounce-in flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-1.5 mx-auto w-fit"
              style={{ animationDelay: "150ms", animationFillMode: "both" }}
            >
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

          {/* Gift emoji with sparkle burst — same emoji as in the machine */}
          <div className="relative inline-block w-24 h-24">
            <div className="absolute inset-0 flex items-center justify-center">
              {["★", "✦", "◆", "✦", "★"].map((s, i) => (
                <span
                  key={i}
                  className={`absolute font-pixel text-[10px] animate-blink opacity-70 ${theme.reveal.subtitle}`}
                  style={{
                    transform: `rotate(${i * 72}deg) translateY(-40px)`,
                    animationDelay: `${200 + i * 150}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce-in"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              {gift.emoji ?? vibe.emoji}
            </div>
          </div>

          <div
            className="space-y-2 animate-fade-up"
            style={{ animationDelay: "350ms" }}
          >
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
          <div
            className="flex items-center justify-center gap-2 animate-fade-up"
            style={{ animationDelay: "450ms" }}
          >
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
          <div
            className="flex items-center justify-center gap-3 pt-2 animate-fade-up"
            style={{ animationDelay: "550ms" }}
          >
            {canTryAgain && (
              <button
                onClick={onResetAction}
                className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform bg-black/20 ${theme.reveal.title}`}
              >
                ↻ TRY AGAIN
              </button>
            )}
            <button
              onClick={onViewPicksAction}
              className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform ${theme.reveal.button}`}
            >
              {canTryAgain ? "★ SEE MY VIBES" : "★ SEE ALL VIBES"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
