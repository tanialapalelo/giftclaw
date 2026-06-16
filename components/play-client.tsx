"use client";

import { useState } from "react";

function DoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 5-pointed star */}
      <path
        d="M28 4L33.5 19.5H50L37 29.5L41.5 45L28 35.5L14.5 45L19 29.5L6 19.5H22.5Z"
        fill="currentColor"
      />
      {/* Inner shine */}
      <path
        d="M28 9L32 21H44L34.5 27.5L38 38.5L28 32L18 38.5L21.5 27.5L12 21H24Z"
        fill="white"
        opacity="0.18"
      />
      {/* Checkmark */}
      <path
        d="M19 27.5L25.5 34L37 22"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkle dots */}
      <circle cx="6" cy="9" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="50" cy="9" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="48" cy="47" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="8" cy="47" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Box body */}
      <rect
        x="6"
        y="22"
        width="36"
        height="22"
        rx="2"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Lid */}
      <rect x="4" y="15" width="40" height="9" rx="2" fill="currentColor" />
      {/* Ribbon vertical */}
      <rect x="21" y="15" width="6" height="29" fill="white" opacity="0.35" />
      {/* Ribbon horizontal on lid */}
      <rect x="4" y="18" width="40" height="3" fill="white" opacity="0.35" />
      {/* Bow left loop */}
      <path
        d="M24 15 C18 8 10 8 12 14 C14 18 22 16 24 15Z"
        fill="white"
        opacity="0.8"
      />
      {/* Bow right loop */}
      <path
        d="M24 15 C30 8 38 8 36 14 C34 18 26 16 24 15Z"
        fill="white"
        opacity="0.8"
      />
      {/* Bow knot */}
      <circle cx="24" cy="15" r="2.5" fill="white" />
    </svg>
  );
}
import { PersonalityCard } from "./personality-card";
import { ClawGame } from "./claw-machine/claw-game";
import { MascotBot } from "./mascot-bot";
import { GrabHistory } from "./grab-history";
import type { Theme } from "@/lib/themes";
import type { GiftSuggestion } from "@/types";
import type { GameResultWithGift } from "@/lib/actions/game";
import { getVibeFromGift } from "@/lib/vibe";

function AlreadyPlayedView({
  results,
  theme,
  validUntil,
}: {
  results: GameResultWithGift[];
  theme: Theme;
  validUntil: string | null;
}) {
  const deadlineText = validUntil
    ? new Date(validUntil).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="animate-fade-in space-y-5 text-center">
      <div className={`flex justify-center ${theme.text.accent}`}>
        <DoneIcon className="w-14 h-14" />
      </div>
      <div>
        <p className={`font-pixel text-xs ${theme.text.primary}`}>
          YOU'VE ALREADY PICKED!
        </p>
        <p className={`mt-1 font-body text-xs ${theme.text.secondary}`}>
          You grabbed {results.length} gift{results.length > 1 ? "s" : ""} —
          your gift-giver can see these picks.
        </p>
        {deadlineText && (
          <p className={`mt-2 font-pixel text-[8px] ${theme.text.accent}`}>
            ⚠ LINK CLOSES: {deadlineText.toUpperCase()}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {results
          .slice()
          .reverse()
          .map((result, i) => {
            const vibe = getVibeFromGift(result.giftSnapshot);
            return (
              <div
                key={result.id}
                className={`flex items-center gap-4 rounded-lg border-2 p-4 text-left ${theme.prize.box}`}
              >
                <div className="text-3xl">{vibe.emoji}</div>
                <div className="flex-1">
                  <p
                    className={`font-pixel text-[8px] ${theme.text.secondary}`}
                  >
                    GRAB {results.length - i}
                  </p>
                  <p className={`font-body text-sm ${theme.text.primary}`}>
                    "{vibe.tagline}"
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {vibe.moodTags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2 py-0.5 font-body text-[10px] bg-black/10 ${theme.text.secondary}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div
        className={`rounded-lg border-2 border-dashed p-4 space-y-1 ${theme.text.secondary}`}
      >
        <p className="font-pixel text-[8px]">⚠ CHANGING YOUR PICKS?</p>
        <p className="font-body text-xs">
          Your gift-giver may have already started shopping based on these
          picks.
        </p>
      </div>
    </div>
  );
}

export function PlayClient({
  friend,
  theme,
  gifts,
  shareToken,
  previousResults,
  alreadyPlayedCount,
  validUntil,
  maxAttempts,
}: {
  friend: {
    name: string;
    interests: string[];
    hobbies: string[];
  };
  theme: Theme;
  gifts: GiftSuggestion[];
  shareToken: string;
  previousResults: GameResultWithGift[] | null;
  alreadyPlayedCount: number;
  validUntil: string | null;
  maxAttempts: number;
}) {
  const [botDismissed, setBotDismissed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const isLocked = alreadyPlayedCount >= maxAttempts;
  const hasPicksSoFar = alreadyPlayedCount > 0;

  return (
    <div>
      {/* MascotBot overlay */}
      {!botDismissed && (
        <MascotBot
          friendName={friend.name}
          previousResults={previousResults}
          theme={theme}
          onDismiss={() => setBotDismissed(true)}
        />
      )}

      {isLocked ? (
        <AlreadyPlayedView
          results={previousResults ?? []}
          theme={theme}
          validUntil={validUntil}
        />
      ) : gameStarted ? (
        <>
          <div className="text-center space-y-1">
            <div className={`flex justify-center ${theme.text.accent}`}>
              <GiftIcon className="w-10 h-10" />
            </div>
            <h1 className={`font-pixel text-lg ${theme.text.primary}`}>
              {friend.name.toUpperCase()}
            </h1>
            <p className={`font-body text-xs ${theme.text.secondary}`}>
              play the claw machine to reveal your gift
            </p>
          </div>
          <ClawGame
            gifts={gifts}
            theme={theme}
            shareToken={shareToken}
            previousGrabCount={alreadyPlayedCount}
            previousResults={previousResults ?? undefined}
          />
        </>
      ) : hasPicksSoFar ? (
        <GrabHistory
          shareToken={shareToken}
          localHistory={previousResults?.map((r) => r.giftSnapshot) ?? []}
          theme={theme}
          canPlayAgain={true}
          onPlayAgain={() => setGameStarted(true)}
        />
      ) : (
        <PersonalityCard
          name={friend.name}
          interests={friend.interests}
          hobbies={friend.hobbies}
          theme={theme}
          onPlay={() => setGameStarted(true)}
        />
      )}
    </div>
  );
}
