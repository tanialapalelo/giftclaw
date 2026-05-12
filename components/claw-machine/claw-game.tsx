"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
import { MAX_ATTEMPTS, COPIES } from "@/lib/constants";
import { getVibeFromGift } from "@/lib/vibe";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Tiny deterministic hash → float 0..1
function hash(a: number, b: number, c: number): number {
  let s = (a * 374761 + b * 668265 + c * 2246822 + 6364136) & 0xffffffff;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  return ((s ^ (s >>> 16)) >>> 0) / 0xffffffff;
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
  const [isTumbling, setIsTumbling] = useState(false);
  const [grabHistory, setGrabHistory] = useState<GiftSuggestion[]>([]);
  const [grabCounts, setGrabCounts] = useState<Map<string, number>>(new Map());
  const [showHistory, setShowHistory] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [lockedGrabKey, setLockedGrabKey] = useState<string | null>(null);
  // Chute-drop animation: show gift emoji dropping from chute before reveal panel
  const [chuteDropActive, setChuteDropActive] = useState(false);
  const [chuteExiting, setChuteExiting] = useState(false);
  const [revealReady, setRevealReady] = useState(false);

  const currentGiftRef = useRef<GiftSuggestion | null>(null);

  const totalAttemptsSoFar = previousGrabCount + grabHistory.length;
  const remainingAttempts = MAX_ATTEMPTS - totalAttemptsSoFar;

  // Stable gift order — shuffled once on mount, never changes.
  // Colors (col index) are derived from this order so they stay consistent
  // across grabs, shuffles, and reveals.
  const stableOrderRef = useRef<GiftSuggestion[]>([]);
  if (stableOrderRef.current.length === 0 && gifts.length > 0) {
    stableOrderRef.current = shuffleArray(gifts);
  }
  const stableGifts = stableOrderRef.current;

  // What the claw can still grab = gifts not yet fully grabbed
  const shuffledGifts = useMemo(
    () => stableGifts.filter((g) => (grabCounts.get(g.name) ?? 0) < COPIES),
    [stableGifts, grabCounts]
  );

  const { state, moveLeft, moveRight, grab, reset } =
    useClawGame(shuffledGifts);
  const { phase, clawX, clawY, targetX, grabbedPrize } = state;

  const nGifts = stableGifts.length;
  const PILE_H = 170;

  const displayItems = useMemo(() => {
    const total = nGifts * COPIES;
    // Choose columns so cells are roughly square-ish
    const cols = Math.max(4, Math.ceil(Math.sqrt(total * 1.4)));
    const rows = Math.ceil(total / cols);
    const cellW = 86 / cols; // % of container width
    const cellH = PILE_H / Math.max(rows, 1);

    // Deterministic shuffle of cell indices keyed to shuffleKey
    const cells = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(hash(i, shuffleKey, 99) * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // Use stableGifts so col index (= color) never changes between grabs
    const items = stableGifts.flatMap((gift, col) => {
      const remainingCopies = COPIES - (grabCounts.get(gift.name) ?? 0);
      return Array.from({ length: remainingCopies }, (_, copy) => {
        const slotIdx = col * COPIES + copy;
        const slot = cells[slotIdx % cells.length]!;
        const cellCol = slot % cols;
        const cellRow = Math.floor(slot / cols);

        // Small jitter: ±15% of cell size so boxes stay in their cell
        const xPct =
          7 +
          cellCol * cellW +
          cellW * 0.5 +
          (hash(col, copy, shuffleKey + 1) - 0.5) * cellW * 0.3;
        const yPx =
          cellRow * cellH +
          cellH * 0.5 +
          (hash(col + 5, copy + 3, shuffleKey + 2) - 0.5) * cellH * 0.35;
        const rot = (hash(col + 11, copy + 7, shuffleKey + 3) - 0.5) * 28; // ±14deg

        return {
          gift,
          col,
          copy,
          key: `${col}-${copy}`,
          xPct,
          yPx,
          rot,
          zIndex: Math.round(yPx * 10) + col,
        };
      });
    });
    return items.sort((a, b) => a.zIndex - b.zIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableGifts, shuffleKey, nGifts, grabCounts]);

  const boxPx = Math.max(
    36,
    Math.min(48, Math.floor(190 / Math.max(nGifts, 1)))
  );

  const handleGrab = useCallback(() => {
    if (phase !== "moving") return;
    const clawInZone = ((clawX - CHUTE_OFFSET) / (100 - CHUTE_OFFSET)) * 100;
    let nearestCol = 0;
    let nearestDist = Infinity;
    let nearestKey: string | null = null;
    let nearestXPct = 50; // default to mid-zone
    for (let col = 0; col < shuffledGifts.length; col++) {
      const copies = displayItems.filter(
        (item) => item.col === col && item.key !== lockedGrabKey
      );
      if (!copies.length) continue;
      const topCopy = copies.reduce((a, b) => (a.yPx < b.yPx ? a : b));
      const dist = Math.abs(topCopy.xPct - clawInZone);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCol = col;
        nearestKey = topCopy.key;
        nearestXPct = topCopy.xPct;
      }
    }
    if (nearestKey) setLockedGrabKey(nearestKey);
    // Convert prize-zone % → container % so claw visually goes to the actual box
    const exactContainerX =
      CHUTE_OFFSET + (nearestXPct / 100) * (100 - CHUTE_OFFSET);
    grab(nearestCol, exactContainerX);
  }, [phase, clawX, shuffledGifts.length, displayItems, lockedGrabKey, grab]);

  const currentGift =
    grabbedPrize !== null ? (shuffledGifts[grabbedPrize] ?? null) : null;

  // Keep ref in sync so handleReset can access it
  useEffect(() => {
    if (currentGift) currentGiftRef.current = currentGift;
  }, [currentGift]);

  // Fix: canTryAgain must be < MAX_ATTEMPTS (not MAX_ATTEMPTS - 1)
  const canTryAgain = totalAttemptsSoFar < MAX_ATTEMPTS;

  const isHoldingPrize = phase === "grabbing" || phase === "lifting";
  // Use the actual gift's emoji so claw shows the same icon as the box being grabbed
  const heldEmoji =
    isHoldingPrize && currentGift ? getVibeFromGift(currentGift).emoji : null;

  // grabsCompleted = saved grabs; currentAttempt = the one being played right now (during moving)
  const grabsCompleted = totalAttemptsSoFar;
  const currentAttempt = Math.min(grabsCompleted + 1, MAX_ATTEMPTS);
  // revealAttempt = the attempt currently shown in result (grabHistory already incremented)
  const revealAttempt = totalAttemptsSoFar;

  // Chute-drop animation: trigger when phase becomes "result"
  useEffect(() => {
    if (phase === "result" && currentGiftRef.current) {
      setChuteDropActive(true);
      setChuteExiting(false);
      setRevealReady(false);
      // After drop animation (750ms), play exit and show reveal panel
      const t1 = setTimeout(() => {
        setChuteExiting(true);
      }, 900);
      const t2 = setTimeout(() => {
        setChuteDropActive(false);
        setChuteExiting(false);
        setRevealReady(true);
      }, 1300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    if (phase !== "result") {
      setRevealReady(false);
    }
  }, [phase]);

  // Screenshake on grab
  useEffect(() => {
    if (phase === "grabbing") {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [phase]);

  const autoSavedRef = useRef(false);
  useEffect(() => {
    if (phase === "dropping" && currentGift && !autoSavedRef.current) {
      autoSavedRef.current = true;
      const grabIndex = previousGrabCount + grabHistory.length + 1;
      // Allow the same gift name multiple times — grabHistory.length drives the attempt counter
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

  // Shared helper — increment grab count for the most recently grabbed gift
  const incrementGrabCount = () => {
    const grabbed = currentGiftRef.current;
    if (grabbed) {
      setGrabCounts((prev) => {
        const next = new Map(prev);
        next.set(grabbed.name, (next.get(grabbed.name) ?? 0) + 1);
        return next;
      });
      currentGiftRef.current = null;
    }
  };

  // Shared reset-to-moving helper (no grabCount change)
  const doReset = () => {
    setLockedGrabKey(null);
    setShuffleKey((k) => k + 1);
    setRevealReady(false);
    reset();
  };

  const handleReset = () => {
    incrementGrabCount();
    doReset();
  };

  const handleViewPicks = () => {
    incrementGrabCount();
    setShowHistory(true);
  };

  // Called from GrabHistory "KEEP PLAYING" — grabCount already incremented by handleViewPicks
  const handleKeepPlaying = () => {
    doReset();
    setShowHistory(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        handleGrab();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [moveLeft, moveRight, handleGrab]);

  if (showHistory) {
    return (
      <GrabHistory
        friendId={friendId}
        localHistory={grabHistory}
        theme={theme}
        canPlayAgain={canTryAgain && remainingAttempts > 0}
        onPlayAgain={handleKeepPlaying}
      />
    );
  }

  // Emoji to show in chute-drop animation
  const chuteEmoji = currentGiftRef.current
    ? getVibeFromGift(currentGiftRef.current).emoji
    : "🎁";

  return (
    <div className={`space-y-4 ${shaking ? "animate-screenshake" : ""}`}>
      {/* Attempt indicator */}
      <div className="flex items-center justify-between px-1 h-6">
        <span className={`font-pixel text-[7px] ${theme.text.secondary}`}>
          ATTEMPT {Math.min(currentAttempt, MAX_ATTEMPTS)}/{MAX_ATTEMPTS}
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

        {/* Attempt dots */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
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

      <MachineFrame
        theme={theme}
        remainingAttempts={remainingAttempts}
        chutePercent={CHUTE_OFFSET}
      >
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

        {/* Prize pile */}
        <div
          className="absolute right-0 overflow-visible"
          style={{ left: `${CHUTE_OFFSET}%`, top: "28%", bottom: "6%" }}
        >
          {displayItems.map((item) => (
            <div
              key={item.key}
              className="absolute"
              style={{
                left: `${item.xPct}%`,
                top: `${item.yPx}px`,
                transform: `translateX(-50%) rotate(${item.rot}deg)`,
                zIndex: item.zIndex,
              }}
            >
              <PrizeBox
                index={item.col}
                isLifted={lockedGrabKey === item.key}
                isTumbling={isTumbling}
                category={item.gift.category}
                giftEmoji={item.gift.emoji}
                sizePx={boxPx}
              />
            </div>
          ))}
        </div>

        {/* Chute-drop animation: gift drops from chute opening */}
        {phase === "result" && chuteDropActive && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${CHUTE_OFFSET / 2}%`,
              bottom: "4px",
              transform: "translateX(-50%)",
              zIndex: 50,
            }}
          >
            <div
              className={
                chuteExiting ? "animate-chute-exit" : "animate-chute-drop"
              }
            >
              <span className="text-4xl drop-shadow-lg">{chuteEmoji}</span>
            </div>
          </div>
        )}

        {/* Floor */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-6 ${theme.machine.floor}`}
        />
      </MachineFrame>

      {/* Reveal Panel — shown after chute-drop animation finishes */}
      {phase === "result" && revealReady && currentGift && (
        <RevealPanel
          gift={currentGift}
          onReset={handleReset}
          onViewPicks={handleViewPicks}
          canTryAgain={canTryAgain && remainingAttempts > 0}
          attemptNumber={revealAttempt}
          maxAttempts={MAX_ATTEMPTS}
          theme={theme}
        />
      )}

      {/* Controls */}
      {phase !== "result" && (
        <div className="flex flex-col items-center gap-2">
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
                onClick={handleGrab}
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
          {phase === "moving" && (
            <button
              onClick={() => {
                setIsTumbling(true);
                setShuffleKey((k) => k + 1);
                setTimeout(() => setIsTumbling(false), 800);
              }}
              className={`flex items-center gap-1.5 rounded-xl border-2 border-black/20 px-4 py-1.5 font-pixel text-[8px] tracking-widest shadow transition-all active:scale-95 active:brightness-75 ${theme.machine.controlPanel} text-white hover:brightness-110`}
            >
              🔀 SHUFFLE
            </button>
          )}
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
