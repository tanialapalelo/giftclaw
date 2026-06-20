"use client";

import type { GamePhase } from "@/hooks/use-claw-game";
import type { Theme } from "@/lib/themes";

export function AttemptIndicator({
  phase,
  currentAttempt,
  grabsCompleted,
  maxAttempts,
  chuteDropActive,
  theme,
}: {
  phase: GamePhase;
  currentAttempt: number;
  grabsCompleted: number;
  maxAttempts: number;
  chuteDropActive: boolean;
  theme: Theme;
}) {
  return (
    <div className="flex items-center justify-between px-1 h-6">
      <span className={`font-pixel text-[7px] ${theme.text.secondary}`}>
        ATTEMPT {Math.min(currentAttempt, maxAttempts)}/{maxAttempts}
      </span>

      <div className="h-6 flex items-center">
        {phase === "moving" && (
          <p
            className={`font-pixel text-[8px] animate-blink ${theme.text.accent}`}
          >
            ◄ MOVE THE CLAW ►
          </p>
        )}
        {phase === "dropping" && (
          <p className={`font-pixel text-[8px] ${theme.text.accent}`}>
            ↓ DROPPING...
          </p>
        )}
        {phase === "grabbing" && (
          <p
            className={`font-pixel text-[8px] animate-blink ${theme.text.accent}`}
          >
            ✦ GRABBING!
          </p>
        )}
        {phase === "lifting" && (
          <p className={`font-pixel text-[8px] ${theme.text.accent}`}>
            ↑ LIFTING...
          </p>
        )}
        {phase === "result" && chuteDropActive && (
          <p
            className={`font-pixel text-[8px] animate-blink ${theme.text.accent}`}
          >
            ✦ OPENING...
          </p>
        )}
      </div>

      <div className="flex gap-1">
        {Array.from({ length: maxAttempts }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < grabsCompleted
                ? theme.controls.grab
                : i === grabsCompleted
                  ? "bg-white/70 animate-blink"
                  : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
