"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useClawGame, CHUTE_OFFSET } from "@/hooks/use-claw-game";
import { MachineFrame } from "./machine-frame";
import { Claw } from "./claw";
import { PrizeBox } from "./prize-box";
import { RevealPanel } from "./reveal-panel";
import { GrabHistory } from "@/components/grab-history";
import { PixelButton } from "@/components/ui/pixel-button";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";
import { saveGameResult } from "@/lib/actions/gift";
import { MAX_ATTEMPTS } from "@/lib/constants";

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
  friendId,
  previousGrabCount = 0,
}: {
  gifts: GiftSuggestion[];
  theme: Theme;
  friendId: string;
  previousGrabCount?: number;
}) {
  const sessionId = useRef(crypto.randomUUID());
  const [shuffleKey, setShuffleKey] = useState(0);
  const [grabHistory, setGrabHistory] = useState<GiftSuggestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [shaking, setShaking] = useState(false);
  // Track which index is being grabbed — persists through "result" phase so box stays hidden
  const [lockedGrabIndex, setLockedGrabIndex] = useState<number | null>(null);

  // Lucky box: one randomly chosen gift name that triggers special celebration if grabbed.
  // Fixed for the whole session so the player can aim for it across all 3 attempts.
  const luckyGiftName = useRef<string | null>(null);
  if (luckyGiftName.current === null && gifts.length > 0) {
    const idx = Math.floor(Math.random() * gifts.length);
    luckyGiftName.current = gifts[idx].name;
  }
  // Is the lucky box still in play (not yet grabbed)?
  const luckyStillAvailable =
    luckyGiftName.current !== null &&
    !grabHistory.some((h) => h.name === luckyGiftName.current);

  // Lucky gift's category — used as the hint icon on the box
  const luckyGift = gifts.find((g) => g.name === luckyGiftName.current);
  const luckyCategory = luckyGift?.category;

  const CATEGORY_EMOJI: Record<string, string> = {
    "Books & Stationery": "📚",
    "Food & Drink": "🍜",
    "Beauty & Self-care": "✨",
    "Tech & Gadgets": "💻",
    "Fashion & Accessories": "🎀",
    "Experience & Activity": "🎪",
    "Home & Living": "🏡",
    "Art & Craft": "🎨",
    "Sports & Fitness": "⚡",
    "Music & Entertainment": "🎵",
  };
  const luckyEmoji = luckyCategory ? (CATEGORY_EMOJI[luckyCategory] ?? "🎁") : "🎁";

  const totalAttemptsSoFar = previousGrabCount + grabHistory.length;
  const remainingAttempts = MAX_ATTEMPTS - totalAttemptsSoFar;

  // Exclude already-grabbed gifts so they don't reappear
  const availableGifts = useMemo(
    () => gifts.filter((g) => !grabHistory.some((h) => h.name === g.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gifts, grabHistory]
  );

  const shuffledGifts = useMemo(
    () => shuffleArray(availableGifts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableGifts, shuffleKey]
  );

  const { state, moveLeft, moveRight, grab, reset } =
    useClawGame(shuffledGifts);
  const { phase, clawX, clawY, targetX, grabbedPrize } = state;

  const currentGift =
    grabbedPrize !== null ? shuffledGifts[grabbedPrize] : null;

  const isCurrentGiftLucky = currentGift?.name === luckyGiftName.current;

  const isHoldingPrize = phase === "grabbing" || phase === "lifting";
  const heldEmoji =
    isHoldingPrize && grabbedPrize !== null
      ? theme.prize.altEmojis[grabbedPrize % theme.prize.altEmojis.length]
      : null;

  const currentAttempt = totalAttemptsSoFar + 1;
  const canTryAgain = totalAttemptsSoFar < MAX_ATTEMPTS - 1;

  // Lock grabbed index as soon as dropping starts so it stays hidden through result phase
  useEffect(() => {
    if (phase === "dropping" && grabbedPrize !== null) {
      setLockedGrabIndex(grabbedPrize);
    }
  }, [phase, grabbedPrize]);

  // Screenshake on grab
  useEffect(() => {
    if (phase === "grabbing") {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [phase]);

  // Auto-save to DB as soon as result is shown — ensures gift-giver sees it immediately
  // without requiring the player to press any button.
  const autoSavedRef = useRef(false);
  useEffect(() => {
    if (phase === "result" && currentGift && !autoSavedRef.current) {
      autoSavedRef.current = true;
      const grabIndex = previousGrabCount + grabHistory.length + 1;
      setGrabHistory((prev) => [...prev, currentGift]);
      void saveGameResult({
        friendId,
        sessionId: sessionId.current,
        grabIndex,
        giftSnapshot: currentGift,
      });
    }
    if (phase === "moving") {
      autoSavedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentGift]);

  const handleReset = () => {
    setLockedGrabIndex(null);
    reset();
    setShuffleKey((k) => k + 1);
  };

  const handleViewPicks = () => {
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
    return <GrabHistory friendId={friendId} localHistory={grabHistory} theme={theme} />;
  }

  return (
    <div className={`space-y-4 ${shaking ? "animate-screenshake" : ""}`}>
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

        {/* Attempt dots */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i < totalAttemptsSoFar ? theme.controls.grab : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      <MachineFrame theme={theme} remainingAttempts={remainingAttempts} chutePercent={CHUTE_OFFSET}>
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

        {/* Prize Boxes — left offset matches chute width exactly so claw zones align */}
        <div
          className="absolute bottom-8 right-0 flex items-end justify-around"
          style={{ left: `${CHUTE_OFFSET}%` }}
        >
          {shuffledGifts.map((gift, i) => (
            <PrizeBox
              key={gift.name}
              index={i}
              isLifted={lockedGrabIndex === i}
              luckyCategory={
                gift.name === luckyGiftName.current ? luckyCategory : undefined
              }
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
          isLucky={isCurrentGiftLucky}
        />
      )}

      {/* Lucky box objective hint — shown while game is active and lucky box not yet grabbed */}
      {phase !== "result" && luckyStillAvailable && (
        <p className={`text-center font-pixel text-[7px] animate-blink ${theme.text.accent}`}>
          {luckyEmoji} FIND THE MYSTERY GIFT BOX FOR A SURPRISE!
        </p>
      )}

      {/* Controls */}
      {phase !== "result" && (
        <div
          className={`mx-auto flex w-fit items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 border-black/30 shadow-[0_4px_0_rgba(0,0,0,0.3)] ${theme.machine.controlPanel}`}
        >
          <PixelButton
            onClick={moveLeft}
            disabled={phase !== "moving"}
            className={`text-lg active:scale-90 active:brightness-75 transition-all ${theme.controls.move}`}
          >
            ◀
          </PixelButton>
          <div className="flex flex-col items-center">
            <PixelButton
              onClick={grab}
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
            onClick={moveRight}
            disabled={phase !== "moving"}
            className={`text-lg active:scale-90 active:brightness-75 transition-all ${theme.controls.move}`}
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
