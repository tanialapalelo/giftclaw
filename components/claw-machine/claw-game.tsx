"use client";

import { useEffect, useMemo, useState } from "react";
import { useClawGame } from "@/hooks/use-claw-game";
import { MachineFrame } from "./machine-frame";
import { Claw } from "./claw";
import { PrizeBox } from "./prize-box";
import { RevealPanel } from "./reveal-panel";
import { GrabHistory } from "@/components/grab-history";
import { PixelButton } from "@/components/ui/pixel-button";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";

const MAX_ATTEMPTS = 3;

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

  const [grabHistory, setGrabHistory] = useState<GiftSuggestion[]>([]);

  const [showHistory, setShowHistory] = useState(false);

  const shuffledGifts = useMemo(
    () => shuffleArray(gifts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gifts, shuffleKey]
  );

  const { state, moveLeft, moveRight, grab, reset } =
    useClawGame(shuffledGifts);
  const { phase, clawX, clawY, targetX, grabbedPrize } = state;

  const currentGift =
    grabbedPrize !== null ? shuffledGifts[grabbedPrize] : null;

  const isHoldingPrize = phase === "grabbing" || phase === "lifting";
  const heldEmoji =
    isHoldingPrize && grabbedPrize !== null
      ? theme.prize.altEmojis[grabbedPrize % theme.prize.altEmojis.length]
      : null;

  const currentAttempt = grabHistory.length + 1;
  const canTryAgain = grabHistory.length < MAX_ATTEMPTS - 1;

  const handleReset = () => {
    if (currentGift) {
      setGrabHistory((prev) => [...prev, currentGift]);
    }
    reset();
    setShuffleKey((k) => k + 1);
  };

  const handleViewPicks = () => {
    if (currentGift) {
      setGrabHistory((prev) => {
        const alreadySaved = prev.includes(currentGift);
        return alreadySaved ? prev : [...prev, currentGift];
      });
    }
    setShowHistory(true);
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

  if (showHistory) {
    return <GrabHistory history={grabHistory} theme={theme} />;
  }

  return (
    <div className="space-y-4">
      {/* Phase + attempt indicator */}
      <div className="flex items-center justify-between px-1 h-6">
        <span className={`font-pixel text-[7px] ${theme.text.secondary}`}>
          ATTEMPT {currentAttempt}/{MAX_ATTEMPTS}
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
        </div>

        {/* Dots indicator — berapa kali sudah grab */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i < grabHistory.length
                  ? theme.controls.grab // sudah dipakai
                  : "bg-white/20" // belum dipakai
              }`}
            />
          ))}
        </div>
      </div>

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
          heldEmoji={isHoldingPrize ? heldEmoji : null}
          theme={theme}
        />

        {/* Prize Boxes */}
        <div className="absolute bottom-8 left-0 right-0 flex items-end justify-around px-2">
          {shuffledGifts.map((_, i) => (
            <PrizeBox
              key={i}
              index={i}
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
        <RevealPanel
          gift={currentGift}
          onReset={handleReset}
          onViewPicks={handleViewPicks}
          canTryAgain={canTryAgain}
          attemptNumber={currentAttempt}
          maxAttempts={MAX_ATTEMPTS}
          theme={theme}
        />
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
