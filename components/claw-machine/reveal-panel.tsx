import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";

export function RevealPanel({
  gift,
  onReset,
  theme,
}: {
  gift: GiftSuggestion;
  onReset: () => void;
  theme: Theme;
}) {
  return (
    <div className={`animate-fade-in p-6 text-center ${theme.reveal.bg}`}>
      <p
        className={`font-pixel text-[8px] uppercase tracking-widest ${theme.reveal.subtitle}`}
      >
        You got...
      </p>
      <h3
        className={`mt-3 font-pixel text-[11px] leading-loose ${theme.reveal.title}`}
      >
        {gift.name}
      </h3>
      <p className={`mt-2 font-body text-sm ${theme.reveal.subtitle}`}>
        {gift.reason}
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <span
          className={`rounded-full px-3 py-1 font-body text-xs ${theme.reveal.badge} bg-black/10`}
        >
          {gift.category}
        </span>
      </div>
      <button
        onClick={onReset}
        className={`mt-5 rounded-full px-8 py-3 font-pixel text-[10px] active:scale-95 transition-transform ${theme.reveal.button}`}
      >
        ↻ TRY AGAIN
      </button>
    </div>
  );
}
