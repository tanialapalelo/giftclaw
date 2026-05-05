import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";

export function RevealPanel({
  gift,
  onReset,
  onViewPicks,
  canTryAgain,
  attemptNumber,
  maxAttempts,
  theme,
}: {
  gift: GiftSuggestion;
  onReset: () => void;
  onViewPicks: () => void;
  canTryAgain: boolean; // false if already attempt three times
  attemptNumber: number; // 1, 2, or 3
  maxAttempts: number; // 3
  theme: Theme;
}) {
  return (
    <div
      className={`animate-fade-in p-6 text-center space-y-3 ${theme.reveal.bg}`}
    >
      {/* Attempt counter */}
      <p
        className={`font-pixel text-[7px] tracking-widest ${theme.reveal.subtitle}`}
      >
        ATTEMPT {attemptNumber} / {maxAttempts}
      </p>

      <p
        className={`font-pixel text-[8px] uppercase tracking-widest ${theme.reveal.subtitle}`}
      >
        You got...
      </p>

      <h3
        className={`font-pixel text-[11px] leading-loose ${theme.reveal.title}`}
      >
        {gift.name}
      </h3>

      <p className={`font-body text-sm ${theme.reveal.subtitle}`}>
        {gift.reason}
      </p>

      <div className="flex items-center justify-center gap-2">
        <span
          className={`rounded-full px-3 py-1 font-body text-xs ${theme.reveal.badge} bg-black/10`}
        >
          {gift.category}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {/* TRY AGAIN — if still have attempts */}
        {canTryAgain && (
          <button
            onClick={onReset}
            className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform bg-black/20 ${theme.reveal.title}`}
          >
            ↻ TRY AGAIN
          </button>
        )}

        {/* SEE MY PICKS */}
        <button
          onClick={onViewPicks}
          className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform ${theme.reveal.button}`}
        >
          {canTryAgain ? "★ SEE PICKS" : "★ SEE ALL PICKS"}
        </button>
      </div>
    </div>
  );
}
