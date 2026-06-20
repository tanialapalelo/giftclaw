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
  isDark = false,
}: {
  gift: GiftSuggestion;
  index: number;
  isDark?: boolean;
}) {
  const emoji = CATEGORY_EMOJI[gift.category.toLowerCase()] ?? "🎁";

  return (
    <PixelCard className="animate-fade-in" dark={isDark}>
      <div className="flex items-start gap-4">
        {/* Number + Emoji */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">{emoji}</span>
          <span className={`font-pixel text-[8px] ${isDark ? "text-white/35" : "text-gray-400"}`}>
            #{index + 1}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className={`font-pixel text-[11px] leading-relaxed ${isDark ? "text-white" : "text-gray-900"}`}>
            {gift.name}
          </h3>
          <p className={`font-body text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>{gift.reason}</p>
          <div className="flex items-center gap-3 pt-1">
            <span className={`rounded-full px-3 py-1 font-body text-xs font-medium ${isDark ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-700"}`}>
              {gift.priceRange}
            </span>
            <span className={`rounded-full px-3 py-1 font-body text-xs ${isDark ? "bg-white/10 text-white/50" : "bg-gray-100 text-gray-500"}`}>
              {gift.category}
            </span>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
