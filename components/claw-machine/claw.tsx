import type { Theme } from "@/lib/themes";
import type { GamePhase } from "@/hooks/use-claw-game";

// Tailwind bg- class → hex for SVG stroke/fill
const rodColorMap: Record<string, string> = {
  "bg-slate-300": "#cbd5e1",
  "bg-pink-300": "#f9a8d4",
  "bg-purple-300": "#d8b4fe",
  "bg-gray-300": "#d1d5db",
  "bg-amber-300": "#fcd34d",
  "bg-fuchsia-300": "#f0abfc",
};
const fingerColorMap: Record<string, string> = {
  "bg-cyan-400": "#22d3ee",
  "bg-pink-400": "#f472b6",
  "bg-purple-400": "#c084fc",
  "bg-gray-200": "#e5e7eb",
  "bg-yellow-300": "#fde047",
  "bg-purple-500": "#a855f7",
};

export function Claw({
  x,
  targetX,
  y,
  phase,
  heldEmoji,
  theme,
}: {
  x: number;
  targetX: number;
  y: number;
  phase: GamePhase;
  heldEmoji: string | null;
  theme: Theme;
}) {
  const rodHeight = Math.max(8, (y / 100) * 320);
  const displayX = phase === "moving" ? x : targetX;

  const isOpen = phase === "moving" || phase === "dropping";
  const isHolding = phase === "grabbing" || phase === "lifting";

  const fingerColor = fingerColorMap[theme.claw.fingers] ?? "#94a3b8";
  const rodColor = rodColorMap[theme.claw.rod] ?? "#cbd5e1";

  // Arms pivot at (0, 5) in SVG space.
  // Each arm: starts at pivot, curves outward, tip hooks back inward.
  const armPath = "M 0,5 C -2,16 -9,29 -8,41 Q -7,46 -1,44";
  const armTransition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
  const pivotOrigin = "0px 5px";

  return (
    <div
      className="absolute top-0 flex flex-col items-center"
      style={{
        left: `${displayX}%`,
        transform: "translateX(-50%)",
        transition:
          phase === "dropping" || phase === "grabbing" || phase === "lifting"
            ? "left 0.7s ease"
            : "left 0.2s ease",
        zIndex: 20,
      }}
    >
      {/* Mounting wheel */}
      <div
        className={`w-5 h-2 rounded-full border border-white/30 ${theme.claw.rod}`}
        style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)" }}
      />

      {/* Rod */}
      <div
        className={`relative w-1.5 ${theme.claw.rod}`}
        style={{
          height: `${rodHeight}px`,
          transition: "height 0.6s ease",
          boxShadow: isHolding ? "0 0 6px rgba(255,255,255,0.4)" : undefined,
        }}
      >
        <div className="absolute inset-y-0 left-0 w-px bg-white/35 rounded-full" />
      </div>

      {/* SVG claw head */}
      <svg
        width="56"
        height="50"
        viewBox="-28 0 56 50"
        className=""
        style={{
          overflow: "visible",
          filter: isHolding
            ? "drop-shadow(0 0 6px rgba(255,255,255,0.7))"
            : undefined,
          transition: "filter 0.3s ease",
        }}
      >
        {/* Hub connector */}
        <rect x="-9" y="0" width="18" height="5" rx="2.5" fill={rodColor} />
        <circle cx="-3.5" cy="2.5" r="1.4" fill="rgba(0,0,0,0.35)" />
        <circle cx="3.5" cy="2.5" r="1.4" fill="rgba(0,0,0,0.35)" />
        {/* Shine on hub */}
        <rect
          x="-8"
          y="0.5"
          width="16"
          height="1.5"
          rx="0.75"
          fill="rgba(255,255,255,0.3)"
        />

        {/* Center arm (always vertical) */}
        <path
          d="M 0,5 L 0,44"
          stroke={fingerColor}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Left arm */}
        <g
          style={{
            transform: isOpen ? "rotate(-40deg)" : "rotate(16deg)",
            transformOrigin: pivotOrigin,
            transition: armTransition,
          }}
        >
          <path
            d={armPath}
            stroke={fingerColor}
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Metallic highlight */}
          <path
            d="M -1,5 C -2,16 -7,29 -6,41"
            stroke="rgba(255,255,255,0.3)"
            fill="none"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>

        {/* Right arm (mirror of left) */}
        <g
          style={{
            transform: isOpen ? "rotate(40deg)" : "rotate(-16deg)",
            transformOrigin: pivotOrigin,
            transition: armTransition,
          }}
        >
          <path
            d={armPath}
            stroke={fingerColor}
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: "scaleX(-1)", transformOrigin: "0px 5px" }}
          />
          <path
            d="M 1,5 C 2,16 7,29 6,41"
            stroke="rgba(255,255,255,0.3)"
            fill="none"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Prize box riding the claw when lifting */}
      {heldEmoji && (
        <div
          className={`-mt-1 flex h-14 w-14 items-center justify-center rounded border-2 text-2xl shadow-md ${theme.prize.box}`}
          style={{
            animation: phase === "grabbing" ? "fade-in 0.2s ease-out" : "none",
          }}
        >
          {heldEmoji}
        </div>
      )}
    </div>
  );
}
