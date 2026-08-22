"use client";

import { useEffect, useState } from "react";
import { getVibeFromGift } from "@/lib/vibe";
import { getGameResultsForFriend } from "@/lib/actions/game";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";

export function GrabHistory({
  shareToken,
  localHistory,
  theme,
  canPlayAgain = false,
  onPlayAgain,
}: {
  shareToken: string;
  /** In-memory grabs from this session, shown instantly then replaced with DB data */
  localHistory: GiftSuggestion[];
  theme: Theme;
  canPlayAgain?: boolean;
  onPlayAgain?: () => void;
}) {
  const [history, setHistory] = useState<GiftSuggestion[]>(localHistory);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [endedEarly, setEndedEarly] = useState(false);

  // Load all grabs for this friend from DB (includes previous sessions)
  useEffect(() => {
    getGameResultsForFriend(shareToken).then((data) => {
      if (data && data.results.length > 0) {
        // Sort ascending by grabIndex so first grab = first card
        const sorted = [...data.results].sort(
          (a, b) => a.grabIndex - b.grabIndex
        );
        setHistory(sorted.map((r) => r.giftSnapshot));
      }
    });
  }, [shareToken]);
  return (
    <div className="animate-fade-in space-y-4 text-center">
      <div className="space-y-1">
        <p
          className={`font-pixel text-[8px] tracking-widest ${theme.text.secondary}`}
        >
          YOUR GIFT VIBES
        </p>
        <h2 className={`font-pixel text-base ${theme.text.primary}`}>
          ★ {history.length} VIBE{history.length > 1 ? "S" : ""} REVEALED ★
        </h2>
        <p className={`font-body text-xs ${theme.text.secondary}`}>
          Your gift-giver can see these. Get ready to be surprised! 🎁
        </p>
      </div>

      <div className="space-y-3">
        {history.map((gift, i) => {
          const vibe = getVibeFromGift(gift);
          return (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-lg border-2 p-4 ${theme.prize.box}`}
            >
              {/* Number badge */}
              <div
                className={`
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-full font-pixel text-[9px]
                ${theme.reveal.bg} ${theme.reveal.title}
              `}
              >
                {i + 1}
              </div>

              {/* Vibe emoji */}
              <div className="text-3xl">{vibe.emoji}</div>

              {/* Vibe info */}
              <div className="flex-1 text-left space-y-1">
                <p
                  className={`font-body text-xs leading-relaxed ${theme.text.primary}`}
                >
                  "{vibe.tagline}"
                </p>
                <div className="flex flex-wrap gap-1">
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

      {endedEarly ? (
        <div className={`rounded-lg border-2 p-4 space-y-1 ${theme.prize.box}`}>
          <p className={`font-pixel text-[9px] ${theme.text.primary}`}>
            🎉 YOU'RE ALL DONE!
          </p>
          <p className={`font-body text-xs ${theme.text.secondary}`}>
            Thanks for playing - your gift-giver can see your picks above.
          </p>
        </div>
      ) : confirmingEnd ? (
        <div className={`rounded-lg border-2 p-4 space-y-3 ${theme.prize.box}`}>
          <p className={`font-body text-xs ${theme.text.primary}`}>
            End your turn now? You won't be able to grab again after this.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setEndedEarly(true)}
              className={`rounded-full px-6 py-2 font-pixel text-[9px] tracking-widest active:scale-95 transition-transform ${theme.reveal.button}`}
            >
              YES, I'M DONE
            </button>
            <button
              onClick={() => setConfirmingEnd(false)}
              className={`rounded-full border px-6 py-2 font-pixel text-[9px] tracking-widest active:scale-95 transition-transform border-current ${theme.text.secondary}`}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        canPlayAgain &&
        onPlayAgain && (
          <div className="space-y-2">
            <button
              onClick={onPlayAgain}
              className={`rounded-full px-8 py-3 font-pixel text-[10px] tracking-widest active:scale-95 transition-transform ${theme.reveal.button}`}
            >
              ↩ KEEP PLAYING
            </button>
            <button
              onClick={() => setConfirmingEnd(true)}
              className={`block w-full font-body text-xs underline underline-offset-2 ${theme.text.secondary}`}
            >
              I'm happy with this, stop here
            </button>
          </div>
        )
      )}

      <p className={`font-pixel text-[7px] ${theme.text.secondary}`}>
        YOUR GIFT-GIVER WILL SEE WHAT TO BUY · STAY SURPRISED ✦
      </p>
    </div>
  );
}
