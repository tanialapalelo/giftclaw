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
      {/* Cabinet Header */}
      <div
        className={`flex items-center justify-center rounded-t-lg py-3 border-4 border-b-0 border-black ${theme.machine.frame}`}
      >
        <h2 className="font-pixel text-[8px] tracking-widest text-white sm:text-[10px]">
          ★ GIFT CLAW ★
        </h2>
      </div>

      {/* Glass Interior */}
      <div className={`relative border-x-4 ${theme.machine.frame}`}>
        <div
          className={`relative h-72 overflow-hidden crt-overlay ${theme.machine.interior}`}
        >
          {children}
        </div>
      </div>

      {/* Cabinet Bottom */}
      <div
        className={`h-4 rounded-b-lg border-4 border-t-0 ${theme.machine.frame}`}
      />
    </div>
  );
}
