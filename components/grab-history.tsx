import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";

export function GrabHistory({
  history,
  theme,
}: {
  history: GiftSuggestion[];
  theme: Theme;
}) {
  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <p
          className={`font-pixel text-[8px] tracking-widest ${theme.text.secondary}`}
        >
          YOUR PICKS
        </p>
        <h2 className={`font-pixel text-base ${theme.text.primary}`}>
          ★ {history.length} GIFT{history.length > 1 ? "S" : ""} REVEALED ★
        </h2>
        <p className={`font-body text-xs ${theme.text.secondary}`}>
          Screenshot this and share it — let them pick one!
        </p>
      </div>

      {/* Gift cards */}
      <div className="space-y-3">
        {history.map((gift, i) => (
          <div
            key={i}
            className={`
              flex items-start gap-4 rounded-lg border-2 p-4
              ${theme.prize.box}
            `}
          >
            {/* Attempt number badge */}
            <div
              className={`
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-full font-pixel text-[9px]
              ${theme.reveal.bg} ${theme.reveal.title}
            `}
            >
              {i + 1}
            </div>

            <div className="flex-1 space-y-1">
              <p
                className={`font-pixel text-[9px] leading-relaxed ${theme.text.primary}`}
              >
                {gift.name}
              </p>

              <span
                className={`
                inline-block rounded-full px-2 py-0.5
                font-body text-[10px] bg-black/10 ${theme.text.secondary}
              `}
              >
                {gift.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p
        className={`text-center font-pixel text-[7px] ${theme.text.secondary}`}
      >
        REFRESH TO PLAY AGAIN FROM SCRATCH
      </p>
    </div>
  );
}
