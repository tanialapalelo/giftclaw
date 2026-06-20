// Category → emoji shown in center of each gift box
const CATEGORY_EMOJI_MAP: [string, string][] = [
  ["book", "📖"],
  ["stationery", "✏️"],
  ["food", "🍜"],
  ["drink", "☕"],
  ["cook", "🍳"],
  ["culinary", "🍳"],
  ["beauty", "💅"],
  ["skincare", "🧴"],
  ["self-care", "🛁"],
  ["wellness", "🧘"],
  ["tech", "💻"],
  ["gadget", "📱"],
  ["electronic", "🎧"],
  ["fashion", "👗"],
  ["cloth", "👗"],
  ["accessory", "💍"],
  ["jewelry", "💍"],
  ["experience", "🎡"],
  ["travel", "✈️"],
  ["adventure", "🏔️"],
  ["home", "🪴"],
  ["living", "🛋️"],
  ["decor", "🕯️"],
  ["art", "🖌️"],
  ["craft", "🧶"],
  ["sport", "🏃"],
  ["fitness", "💪"],
  ["outdoor", "⛺"],
  ["music", "🎵"],
  ["entertainment", "🎬"],
  ["gaming", "🎮"],
  ["game", "🎮"],
  ["photo", "📷"],
  ["plant", "🌱"],
  ["pet", "🐾"],
  ["kid", "🧸"],
  ["toy", "🧸"],
  ["health", "💊"],
  ["spa", "🧖"],
  ["finance", "💰"],
];

function getCategoryEmoji(category?: string): string {
  if (!category) return "🎁";
  const lower = category.toLowerCase();
  for (const [key, emoji] of CATEGORY_EMOJI_MAP) {
    if (lower.includes(key)) return emoji;
  }
  return "🎁";
}

const RIBBON_COLORS = [
  "bg-red-400",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-orange-400",
  "bg-teal-400",
];

const BOX_COLORS: Record<string, string[]> = {
  default: [
    "bg-red-100 border-red-400",
    "bg-yellow-100 border-yellow-400",
    "bg-sky-100 border-sky-400",
    "bg-emerald-100 border-emerald-400",
    "bg-purple-100 border-purple-400",
    "bg-pink-100 border-pink-400",
    "bg-orange-100 border-orange-400",
    "bg-teal-100 border-teal-400",
  ],
  // Soft & Elegant: rose-gold palette, saturated enough for light interior
  warm: [
    "bg-rose-300 border-rose-600",
    "bg-amber-300 border-amber-600",
    "bg-pink-300 border-pink-600",
    "bg-purple-300 border-purple-600",
    "bg-orange-300 border-orange-600",
    "bg-red-300 border-red-600",
    "bg-violet-300 border-violet-600",
    "bg-fuchsia-300 border-fuchsia-600",
  ],
  // Cute & Playful: vivid candy colors, pop on yellow/pink interior
  candy: [
    "bg-fuchsia-400 border-fuchsia-700",
    "bg-cyan-300 border-cyan-600",
    "bg-lime-300 border-lime-600",
    "bg-orange-400 border-orange-700",
    "bg-violet-400 border-violet-700",
    "bg-pink-400 border-pink-700",
    "bg-yellow-300 border-yellow-600",
    "bg-red-400 border-red-700",
  ],
};

export function PrizeBox({
  isLifted,
  isTumbling,
  index,
  category,
  giftEmoji,
  sizePx = 52,
  boxStyle = "default",
}: {
  isLifted: boolean;
  isTumbling?: boolean;
  index: number;
  category?: string;
  /** AI-assigned emoji for this specific gift; overrides category fallback */
  giftEmoji?: string;
  sizePx?: number;
  boxStyle?: string;
}) {
  const emoji = giftEmoji ?? getCategoryEmoji(category);
  const ribbon = RIBBON_COLORS[index % RIBBON_COLORS.length];
  const colors = BOX_COLORS[boxStyle] ?? BOX_COLORS.default!;
  const box = colors[index % colors.length];
  const bowSize = Math.round(sizePx * 0.3);
  const emojiSize = sizePx < 46 ? "text-base" : "text-xl";

  return (
    <div
      className={`
        relative flex flex-col items-center justify-end
        transition-[transform,opacity] duration-400
        ${isLifted ? "scale-0 opacity-0 pointer-events-none" : ""}
        ${isTumbling && !isLifted ? "animate-tumble" : ""}
      `}
      style={{ animationDelay: isTumbling ? `${(index * 73) % 350}ms` : "0s" }}
    >
      {/* Bow */}
      <div
        className="relative flex items-end justify-center mb-0.5"
        style={{ width: sizePx }}
      >
        <div
          className={`absolute left-1 bottom-0 rounded-full border-2 border-white/50 ${ribbon}`}
          style={{
            width: bowSize,
            height: bowSize,
            transform: "rotate(-30deg)",
            transformOrigin: "bottom right",
          }}
        />
        <div
          className={`absolute right-1 bottom-0 rounded-full border-2 border-white/50 ${ribbon}`}
          style={{
            width: bowSize,
            height: bowSize,
            transform: "rotate(30deg)",
            transformOrigin: "bottom left",
          }}
        />
        <div
          className={`relative z-10 rounded-full border-2 border-white/60 ${ribbon}`}
          style={{
            width: Math.round(bowSize * 0.75),
            height: Math.round(bowSize * 0.75),
          }}
        />
      </div>

      {/* Box body */}
      <div
        className={`relative rounded border-4 overflow-hidden ${box}`}
        style={{
          width: sizePx,
          height: sizePx,
          boxShadow: "3px 3px 0 rgba(0,0,0,0.3),5px 5px 0 rgba(0,0,0,0.15)",
        }}
      >
        <div
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 ${ribbon} opacity-70`}
        />
        <div
          className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 ${ribbon} opacity-70`}
        />
        {!isLifted && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span
              className={`${emojiSize} leading-none select-none`}
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
            >
              {emoji}
            </span>
          </div>
        )}
        <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white opacity-50" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/10 rounded-r" />
        <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-black/10 rounded-b" />
        {!isLifted && <div className="absolute inset-0 animate-shimmer" />}
      </div>
    </div>
  );
}
