import type { Theme } from "@/lib/themes";
import type { GamePhase } from "@/hooks/use-claw-game";

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
  heldEmoji: string | null; // ← emoji prize yang dibawa
  theme: Theme;
}) {
  const rodHeight = Math.max(8, (y / 100) * 320);
  const displayX = phase === "moving" ? x : targetX;

  // Fingers OPEN saat moving dan dropping (mau grab)
  // Fingers CLOSED saat grabbing, lifting, result (sudah grab)
  const isOpen = phase === "moving" || phase === "dropping";

  const isHolding = phase === "grabbing" || phase === "lifting";

  return (
    <div
      className={`absolute top-0 flex flex-col items-center ${phase === "moving" ? "animate-sway" : ""}`}
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
      {/* Mounting wheel at top */}
      <div
        className={`w-5 h-2 rounded-full border border-white/30 ${theme.claw.rod}`}
        style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)" }}
      />

      {/* Rod — wider with metallic shine strip */}
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

      {/* Fingers with glow when holding */}
      <div
        className="relative flex items-start justify-center"
        style={{
          filter: isHolding
            ? "drop-shadow(0 0 4px rgba(255,255,255,0.5))"
            : undefined,
          transition: "filter 0.3s ease",
        }}
      >
        {/* Left finger */}
        <div
          className={`h-6 w-2 rounded-bl-full ${theme.claw.fingers}`}
          style={{
            transform: isOpen ? "rotate(-30deg)" : "rotate(30deg)",
            transformOrigin: "top center",
            transition: "transform 0.3s ease",
            marginRight: "2px",
          }}
        />
        {/* Center hook tip */}
        <div
          className={`self-end w-1.5 h-3 rounded-b-full ${theme.claw.fingers}`}
          style={{ marginBottom: "-2px", flexShrink: 0 }}
        />
        {/* Right finger */}
        <div
          className={`h-6 w-2 rounded-br-full ${theme.claw.fingers}`}
          style={{
            transform: isOpen ? "rotate(30deg)" : "rotate(-30deg)",
            transformOrigin: "top center",
            transition: "transform 0.3s ease",
            marginLeft: "2px",
          }}
        />
      </div>

      {/* Prize box riding the claw when lifting */}
      {heldEmoji && (
        <div
          className={`mt-1 flex h-14 w-14 items-center justify-center rounded border-2 text-2xl shadow-md ${theme.prize.box}`}
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
