import type { Theme } from "@/lib/themes";

export function MachineFrame({
  theme,
  children,
  remainingAttempts,
}: {
  theme: Theme;
  children: React.ReactNode;
  remainingAttempts?: number;
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Cabinet Header */}
      <div
        className={`flex items-center justify-between rounded-t-lg px-4 py-3 border-4 border-b-0 border-black ${theme.machine.frame} ${theme.machine.neon}`}
      >
        {/* Lampu kiri */}
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-white animate-blink" />
          <div
            className="h-2 w-2 rounded-full bg-white animate-blink"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        <h2 className="font-pixel text-[8px] tracking-widest text-white sm:text-[10px]">
          ★ GIFT CLAW ★
        </h2>

        {/* Credits / remaining */}
        <div className="flex gap-1">
          {remainingAttempts !== undefined && (
            <span className="font-pixel text-[7px] text-white/70">
              {remainingAttempts}CR
            </span>
          )}
          <div
            className="h-2 w-2 rounded-full bg-white animate-blink"
            style={{ animationDelay: "0.6s" }}
          />
          <div
            className="h-2 w-2 rounded-full bg-white animate-blink"
            style={{ animationDelay: "0.9s" }}
          />
        </div>
      </div>

      {/* Glass Interior */}
      <div className={`relative border-x-4 ${theme.machine.frame}`}>
        <div
          className={`relative h-72 overflow-hidden crt-overlay ${theme.machine.interior}`}
        >
          {/* ── DROP CHUTE (left wall) ── */}
          {/* Vertical slot on the left where grabbed prizes exit */}
          <div
            className={`absolute left-0 top-0 bottom-6 w-9 flex flex-col items-center justify-end pb-1 z-10 border-r-4 ${theme.machine.rail}`}
            style={{ background: "rgba(0,0,0,0.35)" }}
          >
            {/* Arrow indicating drop direction */}
            <div className="flex flex-col items-center gap-0.5 mb-2">
              <div className="font-pixel text-[8px] text-white/50">↓</div>
              <div className="font-pixel text-[8px] text-white/50">↓</div>
            </div>
            {/* Chute opening at bottom */}
            <div className="w-7 h-3 rounded-t-full bg-black/60 border-2 border-white/20" />
          </div>

          {children}
        </div>
      </div>

      {/* Cabinet Bottom */}
      <div
        className={`flex items-center justify-center gap-3 rounded-b-lg border-4 border-t-0 py-2 ${theme.machine.frame}`}
      >
        <div className="h-1.5 w-10 rounded-full bg-black/40" />
        <p className="font-pixel text-[6px] text-white/60 animate-blink">
          INSERT COIN
        </p>
        <div className="h-1.5 w-10 rounded-full bg-black/40" />
      </div>
    </div>
  );
}
