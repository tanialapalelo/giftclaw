import type { Theme } from "@/lib/themes";

// Map neon class to a visible LED bulb color for the cabinet header
const neonToBulb: Record<string, string> = {
  "neon-pink": "bg-pink-400",
  "neon-cyan": "bg-cyan-400",
  "neon-purple": "bg-purple-400",
  "neon-yellow": "bg-yellow-300",
};

export function MachineFrame({
  theme,
  children,
  remainingAttempts,
  chutePercent = 11,
}: {
  theme: Theme;
  children: React.ReactNode;
  remainingAttempts?: number;
  chutePercent?: number;
}) {
  const bulbColor = neonToBulb[theme.machine.neon] ?? "bg-white";

  const Bulb = ({ delay }: { delay: string }) => (
    <div
      className={`h-2 w-2 rounded-full animate-blink ${bulbColor}`}
      style={{
        animationDelay: delay,
        boxShadow: "0 0 6px currentColor, 0 0 12px currentColor",
      }}
    />
  );

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Cabinet Header */}
      <div
        className={`relative flex items-center justify-between rounded-t-lg px-4 py-3 border-4 border-b-0 border-black animate-glow-pulse ${theme.machine.frame} ${theme.machine.neon}`}
      >
        <div className="flex gap-1">
          <Bulb delay="0s" />
          <Bulb delay="0.3s" />
        </div>

        <h2 className="font-pixel text-[8px] tracking-widest text-white sm:text-[10px] drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]">
          ★ GIFT CLAW ★
        </h2>

        <div className="flex items-center gap-1">
          {remainingAttempts !== undefined && (
            <span className="font-pixel text-[7px] text-white/80 mr-1">
              {remainingAttempts}CR
            </span>
          )}
          <Bulb delay="0.6s" />
          <Bulb delay="0.9s" />
        </div>
      </div>

      {/* Glass Interior */}
      <div className={`relative border-x-4 ${theme.machine.frame}`}>
        <div
          className={`relative h-80 overflow-hidden crt-overlay shadow-[inset_0_4px_20px_rgba(0,0,0,0.5),inset_0_-4px_10px_rgba(0,0,0,0.3)] ${theme.machine.interior}`}
        >
          {/* Glass reflection stripe (top arch) */}
          <div className="absolute top-0 left-4 right-4 h-8 rounded-b-full bg-white/10 pointer-events-none z-30" />
          {/* Side glass highlight */}
          <div className="absolute top-2 left-2 bottom-2 w-1 bg-gradient-to-b from-white/25 via-white/5 to-transparent rounded-full pointer-events-none z-30" />

          {/* ── DROP CHUTE (left wall) ── */}
          {/* Width = chutePercent% so prize container can start at the same percentage */}
          <div
            className={`absolute left-0 top-0 bottom-6 flex flex-col items-center justify-end pb-1 z-10 border-r-4 ${theme.machine.rail}`}
            style={{
              width: `${chutePercent}%`,
              background: "rgba(0,0,0,0.45)",
            }}
          >
            <div className="flex flex-col items-center gap-0.5 mb-2">
              <div className="font-pixel text-[8px] text-white/60 animate-blink">
                ↓
              </div>
              <div
                className="font-pixel text-[8px] text-white/60 animate-blink"
                style={{ animationDelay: "0.3s" }}
              >
                ↓
              </div>
            </div>
            {/* Chute opening at bottom */}
            <div className="w-7 h-3 rounded-t-full bg-black/70 border-2 border-white/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" />
          </div>

          {children}
        </div>
      </div>

      {/* Cabinet Bottom */}
      <div
        className={`flex flex-col items-center gap-1 rounded-b-lg border-4 border-t-0 py-2 ${theme.machine.frame}`}
      >
        <div className="flex items-center justify-center gap-3">
          <div className="h-1.5 w-10 rounded-full bg-black/40" />
          <p className="font-pixel text-[6px] text-white/70 animate-coin">
            INSERT COIN
          </p>
          <div className="h-1.5 w-10 rounded-full bg-black/40" />
        </div>
        {/* Coin slot */}
        <div className="w-8 h-1 rounded-full bg-black/70 border border-white/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
      </div>
    </div>
  );
}
