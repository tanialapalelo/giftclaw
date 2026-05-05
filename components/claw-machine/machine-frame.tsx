import type { Theme } from "@/lib/themes";

export function MachineFrame({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Cabinet Header — neon glow dari theme */}
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

        {/* Lampu kanan */}
        <div className="flex gap-1">
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
          {children}
        </div>
      </div>

      {/* Cabinet Bottom — coin slot */}
      <div
        className={`flex items-center justify-center gap-3 rounded-b-lg border-4 border-t-0 py-2 ${theme.machine.frame}`}
      >
        {/* Coin slot */}
        <div className="h-1.5 w-10 rounded-full bg-black/40" />
        <p className="font-pixel text-[6px] text-white/60 animate-blink">
          INSERT COIN
        </p>
        <div className="h-1.5 w-10 rounded-full bg-black/40" />
      </div>
    </div>
  );
}
