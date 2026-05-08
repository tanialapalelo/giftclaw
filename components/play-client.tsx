"use client";

import { useState } from "react";
import { PersonalityCard } from "./personality-card";
import { ClawGame } from "./claw-machine/claw-game";
import { MascotBot } from "./mascot-bot";
import type { Theme } from "@/lib/themes";
import type { GiftSuggestion } from "@/types";
import type { GameResultWithGift } from "@/lib/actions/game";
import { getVibeFromGift } from "@/lib/vibe";

const MAX_ATTEMPTS = 3;

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
      <div className="text-4xl">🎯</div>
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
                    GRAB {i + 1}
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
          {deadlineText
            ? ` The link closes on ${deadlineText} — after that, no changes possible.`
            : " Think carefully before changing!"}
        </p>
      </div>
    </div>
  );
}

export function PlayClient({
  friend,
  theme,
  gifts,
  friendId,
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
  friendId: string;
  previousResults: GameResultWithGift[] | null;
  alreadyPlayedCount: number;
  validUntil: string | null;
  maxAttempts: number;
}) {
  const [botDismissed, setBotDismissed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Player has used all attempts — show locked history view
  const isLocked = alreadyPlayedCount >= maxAttempts;

  return (
    <div className="space-y-6">
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
      ) : !gameStarted ? (
        <PersonalityCard
          name={friend.name}
          interests={friend.interests}
          hobbies={friend.hobbies}
          theme={theme}
          onPlay={() => setGameStarted(true)}
        />
      ) : (
        <>
          <div className="text-center space-y-1">
            <h1 className={`font-pixel text-lg ${theme.text.primary}`}>
              {friend.name} 🎁
            </h1>
            <p className={`font-body text-xs ${theme.text.secondary}`}>
              Play the claw machine to reveal your gift!
            </p>
          </div>
          <ClawGame
            gifts={gifts}
            theme={theme}
            friendId={friendId}
            previousGrabCount={alreadyPlayedCount}
          />
        </>
      )}
    </div>
  );
}
