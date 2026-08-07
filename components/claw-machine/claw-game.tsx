"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useClawGame, CHUTE_OFFSET } from "@/hooks/use-claw-game";
import { MachineFrame } from "./machine-frame";
import { Claw } from "./claw";
import { PrizeBox } from "./prize-box";
import { RevealPanel } from "./reveal-panel";
import { AttemptIndicator } from "./attempt-indicator";
import { GameControls } from "./game-controls";
import { GrabHistory } from "@/components/grab-history";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";
import type { GameResultWithGift } from "@/lib/actions/game";
import { saveGameResult } from "@/lib/actions/gift";
import { MAX_ATTEMPTS, COPIES } from "@/lib/constants";

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
  shareToken,
  previousGrabCount = 0,
  previousResults,
  playStinger,
}: {
  gifts: GiftSuggestion[];
  theme: Theme;
  shareToken: string;
  previousGrabCount?: number;
  previousResults?: GameResultWithGift[];
  playStinger?: () => void;
}) {
  const sessionId = useRef(crypto.randomUUID());
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isTumbling, setIsTumbling] = useState(false);
  const [grabHistory, setGrabHistory] = useState<GiftSuggestion[]>([]);
  const [grabCounts, setGrabCounts] = useState<Map<string, number>>(new Map());
  const [showHistory, setShowHistory] = useState(false);
  const [midGameHistory, setMidGameHistory] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [lockedGrabKey, setLockedGrabKey] = useState<string | null>(null);
  // Chute-drop animation: show gift emoji dropping from chute before reveal panel
  const [chuteDropActive, setChuteDropActive] = useState(false);
  const [chuteExiting, setChuteExiting] = useState(false);
  const [revealReady, setRevealReady] = useState(false);

  const currentGiftRef = useRef<GiftSuggestion | null>(null);

  const totalAttemptsSoFar = previousGrabCount + grabHistory.length;
  const remainingAttempts = MAX_ATTEMPTS - totalAttemptsSoFar;

  // Stable gift order, shuffled once on mount, never changes.
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
  // Must track the machine interior's actual pixel size (h-80 in
  // machine-frame.tsx) and the prize container's top/bottom insets below
  // (top: `${PILE_TOP_PCT}%`, bottom: `${PILE_BOTTOM_PCT}%`) — otherwise
  // the pile's usable height drifts out of sync and leaves a gap above
  // the floor.
  const INTERIOR_H = 320;
  const PILE_TOP_PCT = 18;
  const PILE_BOTTOM_PCT = 6;
  const PILE_H = Math.round(
    (INTERIOR_H * (100 - PILE_TOP_PCT - PILE_BOTTOM_PCT)) / 100
  );

  const boxPx = Math.max(
    44,
    Math.min(60, Math.floor(260 / Math.max(nGifts, 1)))
  );

  const displayItems = useMemo(() => {
    // Use stableGifts so col index (= color) never changes between grabs.
    // Flatten to the copies still actually in the pool — grabbed copies are
    // dropped from this list entirely so piles stay dense as gifts run out,
    // instead of leaving permanent holes where a grabbed item used to sit.
    const remaining = stableGifts.flatMap((gift, col) => {
      const remainingCopies = COPIES - (grabCounts.get(gift.name) ?? 0);
      return Array.from({ length: remainingCopies }, (_, copy) => ({
        gift,
        col,
        copy,
      }));
    });
    const n = remaining.length;
    if (n === 0) return [];

    // Scattered mosaic: a loose grid spanning the whole floor, cells sized
    // and jittered so neighbors overlap at their edges — like prizes tossed
    // into a real claw machine. Most of every box stays visible; nothing
    // sits in a tall column that fully hides what's behind it.
    const rows = Math.max(2, Math.min(4, Math.round(Math.sqrt(n / 1.5))));
    const cols = Math.ceil(n / rows);
    // Boxes render downward from their yPx anchor (bow + box body), so the
    // usable vertical range has to leave room for that height — otherwise
    // the bottom row draws past the container and over the machine floor.
    const itemH = boxPx * 1.3;
    const usableH = Math.max(PILE_H - itemH, itemH);
    // Horizontal margin keeps a box's own half-width from crossing the
    // chute rail on the left or the cabinet wall on the right.
    const MARGIN = 6; // % of container width
    const span = 100 - MARGIN * 2;
    const cellW = span / cols; // % of container width
    const cellH = usableH / rows; // px

    // Deterministic shuffle of cell indices keyed to shuffleKey. Only the
    // first n (one per remaining copy) are used, so the pack always stays
    // fully dense as gifts get grabbed.
    const cells = Array.from({ length: cols * rows }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(hash(i, shuffleKey, 99) * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const items = remaining.map(({ gift, col, copy }, i) => {
      const cell = cells[i]!;
      const cellCol = cell % cols;
      const cellRow = Math.floor(cell / cols);

      // Jitter lets neighboring cells overlap at the edges without one
      // box fully hiding another
      const xPct =
        MARGIN +
        cellCol * cellW +
        cellW * 0.5 +
        (hash(col, copy, shuffleKey + 1) - 0.5) * cellW * 0.3;
      const yPx =
        cellRow * cellH +
        cellH * 0.5 +
        (hash(col + 5, copy + 3, shuffleKey + 2) - 0.5) * cellH * 0.3;
      const rot = (hash(col + 11, copy + 7, shuffleKey + 3) - 0.5) * 36; // ±18deg

      return {
        gift,
        col,
        copy,
        key: `${col}-${copy}`,
        xPct,
        yPx,
        rot,
        // Items closer to the claw (low yPx) get higher z-index so they
        // render in front AND the grab logic picks them first
        zIndex: Math.round((PILE_H - yPx) * 10) + col,
      };
    });
    return items.sort((a, b) => a.zIndex - b.zIndex);
  }, [stableGifts, shuffleKey, nGifts, grabCounts, boxPx]);

  const handleGrab = useCallback(() => {
    if (phase !== "moving") return;
    const clawInZone = ((clawX - CHUTE_OFFSET) / (100 - CHUTE_OFFSET)) * 100;

    // Pick the actual box the claw lands on: among boxes within reach,
    // the frontmost one (highest z-index) wins, same as it would visually
    // block the claw from reaching whatever sits behind it. Only falls
    // back to plain nearest-by-x if nothing is within reach.
    const HIT_RADIUS = 8; // % of the prize zone's width
    const candidates = displayItems.filter(
      (item) => item.key !== lockedGrabKey
    );
    const inReach = candidates.filter(
      (item) => Math.abs(item.xPct - clawInZone) <= HIT_RADIUS
    );
    const pool = inReach.length > 0 ? inReach : candidates;
    const best = pool.reduce<(typeof candidates)[number] | null>(
      (a, b) => {
        if (!a) return b;
        if (inReach.length > 0) return b.zIndex > a.zIndex ? b : a;
        const da = Math.abs(a.xPct - clawInZone);
        const db = Math.abs(b.xPct - clawInZone);
        return db < da ? b : a;
      },
      null
    );
    if (!best) return;

    const nearestShuffledIdx = shuffledGifts.findIndex(
      (gift) => gift.name === best.gift.name
    );
    if (nearestShuffledIdx === -1) return;

    setLockedGrabKey(best.key);
    const exactContainerX =
      CHUTE_OFFSET + (best.xPct / 100) * (100 - CHUTE_OFFSET);
    grab(nearestShuffledIdx, exactContainerX);
  }, [phase, clawX, shuffledGifts, displayItems, lockedGrabKey, grab]);

  const currentGift =
    grabbedPrize !== null ? (shuffledGifts[grabbedPrize] ?? null) : null;

  // Keep ref in sync so handleReset can access it
  useEffect(() => {
    if (currentGift) currentGiftRef.current = currentGift;
  }, [currentGift]);

  // Fix: canTryAgain must be < MAX_ATTEMPTS (not MAX_ATTEMPTS - 1)
  const canTryAgain = totalAttemptsSoFar < MAX_ATTEMPTS;

  const isHoldingPrize = phase === "grabbing" || phase === "lifting";
  // Use the gift's own emoji (same as the box in the machine) for visual consistency
  const heldEmoji =
    isHoldingPrize && currentGift ? (currentGift.emoji ?? "🎁") : null;

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
      // Allow the same gift name multiple times, grabHistory.length drives the attempt counter
      setGrabHistory((prev) => [...prev, currentGift]);
      void saveGameResult({
        shareToken,
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

  // Shared helper, increment grab count for the most recently grabbed gift
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

  const handleViewHistoryMidGame = () => {
    setMidGameHistory(true);
    setShowHistory(true);
  };

  // Called from GrabHistory "KEEP PLAYING"
  // If opened mid-game (no grab happened), just close, no reshuffle needed
  const handleKeepPlaying = () => {
    if (!midGameHistory) doReset();
    setMidGameHistory(false);
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

  // Combine previous sessions + current session so GrabHistory shows all picks immediately
  const combinedHistory = [
    ...(previousResults ?? [])
      .slice()
      .sort((a, b) => a.grabIndex - b.grabIndex)
      .map((r) => r.giftSnapshot),
    ...grabHistory,
  ];

  if (showHistory) {
    return (
      <GrabHistory
        shareToken={shareToken}
        localHistory={combinedHistory}
        theme={theme}
        canPlayAgain={canTryAgain && remainingAttempts > 0}
        onPlayAgain={handleKeepPlaying}
      />
    );
  }

  const chuteEmoji = currentGiftRef.current?.emoji ?? "🎁";

  return (
    <div className={`space-y-4 ${shaking ? "animate-screenshake" : ""}`}>
      <AttemptIndicator
        phase={phase}
        currentAttempt={currentAttempt}
        grabsCompleted={grabsCompleted}
        maxAttempts={MAX_ATTEMPTS}
        chuteDropActive={chuteDropActive}
        theme={theme}
      />

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
          style={{
            left: `${CHUTE_OFFSET}%`,
            top: `${PILE_TOP_PCT}%`,
            bottom: `${PILE_BOTTOM_PCT}%`,
          }}
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
                boxStyle={theme.prize.boxStyle}
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

      {/* Reveal Panel, shown after chute-drop animation finishes */}
      {phase === "result" && revealReady && currentGift && (
        <RevealPanel
          gift={currentGift}
          onResetAction={handleReset}
          onViewPicksAction={handleViewPicks}
          canTryAgain={canTryAgain && remainingAttempts > 0}
          attemptNumber={revealAttempt}
          maxAttempts={MAX_ATTEMPTS}
          theme={theme}
          playStinger={playStinger}
        />
      )}

      {phase !== "result" && (
        <GameControls
          phase={phase}
          onMoveLeft={moveLeft}
          onMoveRight={moveRight}
          onGrab={handleGrab}
          onShuffle={() => {
            setIsTumbling(true);
            setShuffleKey((k) => k + 1);
            setTimeout(() => setIsTumbling(false), 800);
          }}
          onViewHistory={handleViewHistoryMidGame}
          pickCount={previousGrabCount + grabHistory.length}
          maxAttempts={MAX_ATTEMPTS}
          theme={theme}
        />
      )}
    </div>
  );
}
