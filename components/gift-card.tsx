// components/gift-card.tsx
import { PixelCard } from "@/components/ui/pixel-card";
import type { GiftSuggestion } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "💻",
  books: "📚",
  fashion: "👗",
  food: "🍜",
  experience: "🎭",
  beauty: "✨",
  sports: "⚽",
  home: "🏠",
  games: "🎮",
  music: "🎵",
  art: "🎨",
  travel: "✈️",
};

export function GiftCard({
  gift,
  index,
}: {
  gift: GiftSuggestion;
  index: number;
}) {
  const emoji = CATEGORY_EMOJI[gift.category.toLowerCase()] ?? "🎁";

  return (
    <PixelCard className="animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Number + Emoji */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">{emoji}</span>
          <span className="font-pixel text-[8px] text-gray-400">
            #{index + 1}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className="font-pixel text-[11px] leading-relaxed text-gray-900">
            {gift.name}
          </h3>
          <p className="font-body text-sm text-gray-600">{gift.reason}</p>
          <div className="flex items-center gap-3 pt-1">
            <span className="rounded-full bg-gray-100 px-3 py-1 font-body text-xs text-gray-500">
              {gift.category}
            </span>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
