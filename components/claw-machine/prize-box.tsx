// components/claw-machine/prize-box.tsx

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
}: {
  isLifted: boolean;
  index: number;
}) {
  const ribbon = RIBBON_COLORS[index % RIBBON_COLORS.length];
  const box = BOX_COLORS[index % BOX_COLORS.length];

  return (
    <div
      className={`
        relative flex flex-col items-center justify-end
        animate-float
        ${isLifted ? "opacity-0 scale-0 transition-all duration-150 pointer-events-none" : "opacity-100 scale-100 transition-all duration-300"}
      `}
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      {/* Bow on top */}
      <div className="relative flex items-end justify-center mb-0.5 w-14">
        {/* Left loop */}
        <div
          className={`absolute left-1 bottom-0 h-4 w-4 rounded-full border-2 border-white/50 ${ribbon}`}
          style={{
            transform: "rotate(-30deg)",
            transformOrigin: "bottom right",
          }}
        />
        {/* Right loop */}
        <div
          className={`absolute right-1 bottom-0 h-4 w-4 rounded-full border-2 border-white/50 ${ribbon}`}
          style={{ transform: "rotate(30deg)", transformOrigin: "bottom left" }}
        />
        {/* Center knot */}
        <div
          className={`relative z-10 h-3 w-3 rounded-full border-2 border-white/60 ${ribbon}`}
        />
      </div>

      {/* Box body */}
      <div
        className={`relative h-14 w-14 rounded border-4 overflow-hidden shadow-[3px_3px_0_rgba(0,0,0,0.3),6px_6px_0_rgba(0,0,0,0.15)] ${box}`}
      >
        {/* Horizontal ribbon stripe */}
        <div
          className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 ${ribbon} opacity-70`}
        />
        {/* Vertical ribbon stripe */}
        <div
          className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 ${ribbon} opacity-70`}
        />
        {/* Shine */}
        <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white opacity-50" />
        {/* 3D depth — right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/10 rounded-r" />
        {/* 3D depth — bottom edge */}
        <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-black/10 rounded-b" />
        {/* Shimmer overlay (only when not lifted) */}
        {!isLifted && <div className="absolute inset-0 animate-shimmer" />}
      </div>
    </div>
  );
}
