"use client";

import { useState } from "react";
import type { Theme } from "@/lib/themes";

// Mapping keyword interests → emoji
const INTEREST_EMOJI: Record<string, string> = {
  reading: "📚",
  books: "📚",
  music: "🎵",
  gaming: "🎮",
  games: "🎮",
  cooking: "🍳",
  food: "🍜",
  travel: "✈️",
  art: "🎨",
  drawing: "🎨",
  film: "🎬",
  movies: "🎬",
  photography: "📷",
  fashion: "👗",
  fitness: "💪",
  sports: "⚽",
  tech: "💻",
  coding: "💻",
  nature: "🌿",
  plants: "🌿",
  coffee: "☕",
  cats: "🐱",
  dogs: "🐶",
  anime: "✨",
};

function getEmoji(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, emoji] of Object.entries(INTEREST_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "✦"; // default fallback
}

// Trim whitespace dan ignore empty tags
function parseTags(input: string | string[]): string[] {
  const tags = Array.isArray(input) ? input : input.split(/[,،\n]+/);

  return tags
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function PersonalityCard({
  name,
  interests,
  hobbies,
  theme,
  onPlay,
}: {
  name: string;
  interests: string[];
  hobbies: string[];
  theme: Theme;
  onPlay: () => void; // callback when click PLAY button
}) {
  const [dismissed, setDismissed] = useState(false);

  // combine interests and hobbies into one pool of tags
  const allTags = [...parseTags(interests), ...parseTags(hobbies)];

  // deduplicate, if user put same tag in both interests & hobbies, we only show once
  const uniqueTags = [...new Set(allTags)];

  const handlePlay = () => {
    setDismissed(true);

    // a little delay to let the dismiss animation play before showing the game
    setTimeout(onPlay, 300);
  };

  if (dismissed) return null;

  return (
    <div className="animate-fade-in space-y-4 text-center">
      {/* Avatar placeholder — pixel art style */}
      <div className="relative inline-block">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border-4 text-4xl mx-auto ${theme.machine.frame}`}
        >
          🎁
        </div>
        {/* Neon ring di avatar */}
        <div
          className={`absolute inset-0 rounded-full ${theme.machine.neon} opacity-50`}
        />
      </div>

      {/* Greeting */}
      <div>
        <p
          className={`font-pixel text-[8px] tracking-widest uppercase ${theme.text.secondary}`}
        >
          someone prepared a gift for
        </p>
        <h1 className={`mt-1 font-pixel text-xl ${theme.text.primary}`}>
          {name} ✦
        </h1>
      </div>

      {/* Personality tags */}
      {uniqueTags.length > 0 && (
        <div className="space-y-2">
          <p
            className={`font-pixel text-[7px] tracking-widest ${theme.text.secondary}`}
          >
            YOU'RE INTO
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {uniqueTags.map((tag) => (
              <span
                key={tag}
                className={`
                  inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
                  font-body text-xs font-medium
                  ${theme.machine.frame} ${theme.text.primary}
                  bg-black/10
                `}
              >
                <span>{getEmoji(tag)}</span>
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <p
        className={`font-body text-sm max-w-xs mx-auto leading-relaxed ${theme.text.secondary}`}
      >
        Gifts were picked based on who you are. Play the claw machine to reveal
        yours!
      </p>

      {/* CTA */}
      <button
        onClick={handlePlay}
        className={`
          mt-2 rounded-full px-10 py-4 font-pixel text-[10px]
          transition-transform active:scale-95 hover:scale-105
          ${theme.reveal.button}
        `}
      >
        🕹️ &nbsp;PLAY NOW
      </button>
    </div>
  );
}
