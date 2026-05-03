// components/claw-machine/prize-box.tsx
import type { Theme } from "@/lib/themes";

export function PrizeBox({
  isLifted,
  index,
  theme,
}: {
  isLifted: boolean;
  index: number; // ← untuk pilih emoji berbeda per box
  theme: Theme;
}) {
  // Placeholder kosong saat prize dibawa claw naik
  // Kenapa tidak display:none? justify-around akan redistribute spacing
  // → box lain bergeser → visual glitch
  if (isLifted) {
    return <div className="h-16 w-14" />;
  }

  // Setiap box pakai emoji berbeda dari altEmojis
  // index % length = cycling, tidak pernah out of bounds
  const emoji = theme.prize.altEmojis[index % theme.prize.altEmojis.length];

  return (
    <div
      className={`
        relative flex h-16 w-14 flex-col items-center justify-center
        rounded-lg border-4 text-2xl shadow-lg
        animate-float
        ${theme.prize.box}
      `}
      style={{
        // Tiap box punya delay float berbeda → tidak bergerak serentak
        // Lebih hidup seperti prizes di dalam claw machine asli
        animationDelay: `${index * 0.3}s`,
      }}
    >
      {/* Shine effect di pojok kiri atas box */}
      <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white opacity-40" />
      <span className="drop-shadow-md">{emoji}</span>
    </div>
  );
}
