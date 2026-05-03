// app/friends/[id]/gifts/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFriend } from "@/lib/actions/friend";
import { getGiftSuggestions } from "@/lib/actions/gift";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { PixelButton } from "@/components/ui/pixel-button";
import { GiftCard } from "@/components/gift-card";
import type { GiftSuggestion } from "@/types";

export default async function GiftsPage({
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

  return (
    <PixelLayout theme={theme}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="font-pixel text-[8px] uppercase tracking-widest text-gray-500">
            AI Gift Ideas for
          </p>
          <h1 className={`mt-1 font-pixel text-base ${theme.text.primary}`}>
            {friend.name}
          </h1>
          {result.cached && (
            <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 font-body text-xs text-green-700">
              ✦ Saved suggestions
            </span>
          )}
        </div>

        {/* Error State */}
        {"error" in result && result.error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center">
            <p className="font-body text-sm text-red-600">{result.error}</p>
          </div>
        )}

        {/* Gift Cards */}
        {"suggestions" in result && result.suggestions && (
          <div className="space-y-4">
            {(result.suggestions as GiftSuggestion[]).map((gift, i) => (
              <GiftCard key={i} gift={gift} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <Link href={`/friends/${id}/claw`} className="block">
            <PixelButton className="w-full bg-gray-900 text-white hover:bg-gray-700">
              🕹️ PLAY CLAW MACHINE
            </PixelButton>
          </Link>
          <Link href={`/friends/${id}`} className="block">
            <PixelButton className="w-full bg-white text-gray-900">
              ← BACK TO PROFILE
            </PixelButton>
          </Link>
        </div>
      </div>
    </PixelLayout>
  );
}
