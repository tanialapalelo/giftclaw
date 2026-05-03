"use client";

import { useEffect, useMemo, useState } from "react";
import { useClawGame } from "@/hooks/use-claw-game";
import { MachineFrame } from "./machine-frame";
import { Claw } from "./claw";
import { PrizeBox } from "./prize-box";
import { RevealPanel } from "./reveal-panel";
import { PixelButton } from "@/components/ui/pixel-button";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function ClawGame({
  gifts,
  theme,
}: {
  gifts: GiftSuggestion[];
  theme: Theme;
}) {
  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffledGifts = useMemo(
    () => shuffleArray(gifts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gifts, shuffleKey]
  );

  const { state, moveLeft, moveRight, grab, reset } =
    useClawGame(shuffledGifts);
  const { phase, clawX, clawY, targetX, grabbedPrize } = state;

  const handleReset = () => {
    reset();
    setShuffleKey((k) => k + 1);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        grab();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveLeft, moveRight, grab]);

  const currentGift =
    grabbedPrize !== null ? shuffledGifts[grabbedPrize] : null;

  // Prize ikut claw saat grabbing + lifting
  // Saat dropping belum grab, jadi belum bawa prize
  const isHoldingPrize = phase === "grabbing" || phase === "lifting";
  const heldEmoji =
    isHoldingPrize && grabbedPrize !== null
      ? theme.prize.altEmojis[grabbedPrize % theme.prize.altEmojis.length]
      : null;

  return (
    <div className="space-y-4">
      <MachineFrame theme={theme}>
        {/* Rail */}
        <div
          className={`absolute left-0 right-0 top-0 h-2 ${theme.machine.rail}`}
        />

        <Claw
          x={clawX}
          targetX={targetX}
          y={clawY}
          phase={phase}
          // Pass emoji prize ke claw saat holding
          // null saat belum grab atau sudah reveal
          heldEmoji={isHoldingPrize ? heldEmoji : null}
          theme={theme}
        />

        {/* Prize Boxes di floor */}
        {/* Prize Boxes */}
        <div className="absolute bottom-8 left-0 right-0 flex items-end justify-around px-2">
          {shuffledGifts.map((_, i) => (
            <PrizeBox
              key={i}
              index={i} // ← tambah ini
              isLifted={isHoldingPrize && grabbedPrize === i}
              theme={theme}
            />
          ))}
        </div>

        {/* Floor */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-6 ${theme.machine.floor}`}
        />
      </MachineFrame>

      {/* Reveal Panel */}
      {phase === "result" && currentGift && (
        <RevealPanel gift={currentGift} onReset={handleReset} theme={theme} />
      )}

      {/* Controls */}
      {phase !== "result" && (
        <div className="flex items-center justify-center gap-3">
          <PixelButton
            onClick={moveLeft}
            disabled={phase !== "moving"}
            className={`text-lg ${theme.controls.move}`}
          >
            ◀
          </PixelButton>
          <PixelButton
            onClick={grab}
            disabled={phase !== "moving"}
            className={`px-8 ${theme.controls.grab}`}
          >
            GRAB
          </PixelButton>
          <PixelButton
            onClick={moveRight}
            disabled={phase !== "moving"}
            className={`text-lg ${theme.controls.move}`}
          >
            ▶
          </PixelButton>
        </div>
      )}

      {phase === "moving" && (
        <p className="text-center font-body text-[10px] text-gray-400">
          ← → arrow keys to move · space to grab
        </p>
      )}
    </div>
  );
}
