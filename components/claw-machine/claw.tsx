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
  const rodHeight = Math.max(8, (y / 100) * 288);
  const displayX = phase === "moving" ? x : targetX;

  // Fingers OPEN saat moving dan dropping (mau grab)
  // Fingers CLOSED saat grabbing, lifting, result (sudah grab)
  const isOpen = phase === "moving" || phase === "dropping";

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
      {/* Rod */}
      <div
        className={`w-1 ${theme.claw.rod}`}
        style={{
          height: `${rodHeight}px`,
          transition: "height 0.6s ease",
        }}
      />

      {/* Fingers */}
      <div className="relative flex items-start justify-center">
        {/* Left finger */}
        <div
          className={`h-6 w-2 rounded-bl-full ${theme.claw.fingers}`}
          style={{
            // Open → rotate outward (-30deg)
            // Closed → rotate inward (30deg)
            transform: isOpen ? "rotate(-30deg)" : "rotate(30deg)",
            transformOrigin: "top center",
            transition: "transform 0.3s ease",
            marginRight: "2px",
          }}
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

      {/* Prize box ikut naik bersama claw saat lifting */}
      {heldEmoji && (
        <div
          className={`mt-1 flex h-14 w-14 items-center justify-center rounded border-2 text-2xl shadow-md ${theme.prize.box}`}
          style={{
            // fade in saat grab, langsung visible
            animation: phase === "grabbing" ? "fade-in 0.2s ease-out" : "none",
          }}
        >
          {heldEmoji}
        </div>
      )}
    </div>
  );
}
