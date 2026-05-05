"use client";

import { useState } from "react";
import { PersonalityCard } from "./personality-card";
import { ClawGame } from "./claw-machine/claw-game";
import type { Theme } from "@/lib/themes";
import type { GiftSuggestion } from "@/types";

export function PlayClient({
  friend,
  theme,
  gifts,
}: {
  friend: {
    name: string;
    interests: string[];
    hobbies: string[];
  };
  theme: Theme;
  gifts: GiftSuggestion[];
}) {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="space-y-6">
      {!gameStarted ? (
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
          <ClawGame gifts={gifts} theme={theme} />
        </>
      )}
    </div>
  );
}
