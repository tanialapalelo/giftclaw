"use client";

import type { GamePhase } from "@/hooks/use-claw-game";
import type { Theme } from "@/lib/themes";
import { PixelButton } from "@/components/ui/pixel-button";

export function GameControls({
  phase,
  onMoveLeft,
  onMoveRight,
  onGrab,
  onShuffle,
  theme,
}: {
  phase: GamePhase;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onGrab: () => void;
  onShuffle: () => void;
  theme: Theme;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`mx-auto flex w-fit items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 border-black/30 shadow-[0_4px_0_rgba(0,0,0,0.3)] ${theme.machine.controlPanel}`}
      >
        <PixelButton
          onClick={onMoveLeft}
          disabled={phase !== "moving"}
          className={`text-lg active:scale-90 active:brightness-75 transition-all ${theme.controls.move}`}
        >
          ◀
        </PixelButton>
        <div className="flex flex-col items-center">
          <PixelButton
            onClick={onGrab}
            disabled={phase !== "moving"}
            className={`px-8 ${theme.controls.grab} ${phase === "moving" ? "active:scale-90" : ""} active:brightness-75 transition-all`}
          >
            GRAB
          </PixelButton>
          {phase === "moving" && (
            <span className="font-pixel text-[8px] text-white/70 animate-blink mt-1">
              ♪ SPACE
            </span>
          )}
        </div>
        <PixelButton
          onClick={onMoveRight}
          disabled={phase !== "moving"}
          className={`text-lg active:scale-90 active:brightness-75 transition-all ${theme.controls.move}`}
        >
          ▶
        </PixelButton>
      </div>
      {phase === "moving" && (
        <button
          onClick={onShuffle}
          className={`flex items-center gap-1.5 rounded-xl border-2 border-black/20 px-4 py-1.5 font-pixel text-[8px] tracking-widest shadow transition-all active:scale-95 active:brightness-75 ${theme.machine.controlPanel} text-white hover:brightness-110`}
        >
          🔀 SHUFFLE
        </button>
      )}
    </div>
  );
}
