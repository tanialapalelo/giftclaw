// app/friends/[id]/claw/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFriend } from "@/lib/actions/friend";
import { getGiftSuggestions } from "@/lib/actions/gift";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { ClawGame } from "@/components/claw-machine/claw-game";
import type { GiftSuggestion } from "@/types";

export default async function ClawPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const friend = await getFriend(id);
  if (!friend) notFound();

  const themeKey = friend.theme as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES.soft;

  const result = await getGiftSuggestions(id);

  if ("error" in result) {
    return (
      <PixelLayout theme={theme}>
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 text-center">
          <p className="font-pixel text-[10px] text-red-600">
            Could not load gifts
          </p>
          <p className="mt-2 font-body text-sm text-red-500">{result.error}</p>
          <Link
            href={`/friends/${id}`}
            className="mt-4 inline-block font-body text-sm text-gray-500 underline"
          >
            ← Back to profile
          </Link>
        </div>
      </PixelLayout>
    );
  }

  return (
    <PixelLayout theme={theme}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <p
            className={`font-pixel text-[8px] uppercase tracking-widest ${theme.text.secondary}`}
          >
            Finding gifts for
          </p>
          <h1 className={`mt-1 font-pixel text-base ${theme.text.primary}`}>
            {friend.name}
          </h1>
        </div>

        {/* Game */}
        <ClawGame
          gifts={result.suggestions as GiftSuggestion[]}
          theme={theme}
        />

        {/* Links */}
        <div className="flex justify-center gap-6 pt-2">
          <Link
            href={`/friends/${id}/gifts`}
            className="font-body text-xs text-gray-400 underline hover:text-gray-600"
          >
            See all gift ideas
          </Link>
          <Link
            href={`/friends/${id}`}
            className="font-body text-xs text-gray-400 underline hover:text-gray-600"
          >
            ← Back to profile
          </Link>
        </div>
      </div>
    </PixelLayout>
  );
}
