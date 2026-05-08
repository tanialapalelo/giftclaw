// Category → emoji hint shown on the lucky box beacon
const CATEGORY_EMOJI: Record<string, string> = {
  "Books & Stationery": "📚",
  "Food & Drink": "🍜",
  "Beauty & Self-care": "✨",
  "Tech & Gadgets": "💻",
  "Fashion & Accessories": "🎀",
  "Experience & Activity": "🎪",
  "Home & Living": "🏡",
  "Art & Craft": "🎨",
  "Sports & Fitness": "⚡",
  "Music & Entertainment": "🎵",
};

// Ribbon colors per index so each box looks unique
const RIBBON_COLORS = [
  "bg-red-400",
  "bg-yellow-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
];

const BOX_COLORS = [
  "bg-red-100 border-red-400",
  "bg-yellow-100 border-yellow-400",
  "bg-sky-100 border-sky-400",
  "bg-emerald-100 border-emerald-400",
  "bg-purple-100 border-purple-400",
];

export function PrizeBox({
  isLifted,
  index,
  luckyCategory,
}: {
  isLifted: boolean;
  index: number;
  /** If set, this box is the lucky box and shows this category as a hint icon */
  luckyCategory?: string;
}) {
  const isLucky = !!luckyCategory;
  const beaconEmoji = luckyCategory ? (CATEGORY_EMOJI[luckyCategory] ?? "🎁") : null;

  // Lucky box gets golden ribbon/box
  const ribbon = isLucky ? "bg-yellow-400" : RIBBON_COLORS[index % RIBBON_COLORS.length];
  const box = isLucky
    ? "bg-yellow-50 border-yellow-500"
    : BOX_COLORS[index % BOX_COLORS.length];

  return (
    <div
      className={`
        relative flex flex-col items-center justify-end
        ${isLifted ? "animate-poof pointer-events-none" : "animate-float"}
      `}
      style={{ animationDelay: isLifted ? "0s" : `${index * 0.3}s` }}
    >
      {/* Lucky box beacon — shows category emoji as hint, only while not yet grabbed */}
      {isLucky && !isLifted && beaconEmoji && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-0.5">
          <span
            className="text-base animate-blink block text-center leading-none"
            style={{ filter: "drop-shadow(0 0 5px rgba(250,204,21,0.9))" }}
          >
            {beaconEmoji}
          </span>
          <span
            className="font-pixel text-[6px] leading-none"
            style={{ color: "#facc15", textShadow: "0 0 4px #facc15" }}
          >
            ?
          </span>
        </div>
      )}

      {/* Bow on top */}
      <div className="relative flex items-end justify-center mb-0.5 w-14">
        {/* Left loop */}
        <div
          className={`absolute left-1 bottom-0 h-4 w-4 rounded-full border-2 border-white/50 ${ribbon}`}
          style={{ transform: "rotate(-30deg)", transformOrigin: "bottom right" }}
        />
        {/* Right loop */}
        <div
          className={`absolute right-1 bottom-0 h-4 w-4 rounded-full border-2 border-white/50 ${ribbon}`}
          style={{ transform: "rotate(30deg)", transformOrigin: "bottom left" }}
        />
        {/* Center knot */}
        <div className={`relative z-10 h-3 w-3 rounded-full border-2 border-white/60 ${ribbon}`} />
      </div>

      {/* Box body */}
      <div
        className={`relative h-14 w-14 rounded border-4 overflow-hidden ${box}`}
        style={{
          boxShadow: isLucky
            ? "3px 3px 0 rgba(0,0,0,0.3), 6px 6px 0 rgba(0,0,0,0.15), 0 0 10px rgba(250,204,21,0.55), 0 0 22px rgba(250,204,21,0.25)"
            : "3px 3px 0 rgba(0,0,0,0.3), 6px 6px 0 rgba(0,0,0,0.15)",
        }}
      >
        {/* Horizontal ribbon stripe */}
        <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 ${ribbon} opacity-70`} />
        {/* Vertical ribbon stripe */}
        <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 ${ribbon} opacity-70`} />
        {/* Shine */}
        <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white opacity-50" />
        {/* 3D depth — right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/10 rounded-r" />
        {/* 3D depth — bottom edge */}
        <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-black/10 rounded-b" />
        {/* Shimmer overlay */}
        {!isLifted && <div className="absolute inset-0 animate-shimmer" />}
        {/* Lucky extra shimmer — brighter */}
        {isLucky && !isLifted && (
          <div className="absolute inset-0 animate-shimmer" style={{ opacity: 0.6 }} />
        )}
      </div>
    </div>
  );
}
