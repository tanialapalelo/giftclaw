import { notFound } from "next/navigation";
import { getFriendByShareToken } from "@/lib/actions/friend";
import { getGiftSuggestions } from "@/lib/actions/gift";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { ClawGame } from "@/components/claw-machine/claw-game";
import { isValidUUID } from "@/lib/utils";
import type { GiftSuggestion } from "@/types";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  if (!isValidUUID(shareToken)) notFound();

  const friend = await getFriendByShareToken(shareToken);
  if (!friend) notFound();

  const theme = THEMES[friend.theme as keyof typeof THEMES] ?? THEMES.soft;

  const result = await getGiftSuggestions(friend.id);

  if ("error" in result) {
    return (
      <PixelLayout theme={theme}>
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center space-y-2">
          <p className="font-pixel text-[10px] text-red-600">
            COULD NOT LOAD GIFTS
          </p>
          <p className="font-body text-sm text-red-500">{result.error}</p>
          {"remaining" in result && (
            <p className="font-pixel text-[8px] text-red-400">
              TOO MANY REQUESTS — TRY AGAIN IN A MINUTE
            </p>
          )}
        </div>
      </PixelLayout>
    );
  }

  return (
    <PixelLayout theme={theme}>
      <div className="space-y-6">
        {/* Receiver header — zero sensitive data */}
        <div className="text-center space-y-1">
          <p
            className={`font-pixel text-[8px] uppercase tracking-widest ${theme.text.secondary}`}
          >
            A GIFT WAS PREPARED FOR
          </p>
          <h1 className={`font-pixel text-lg ${theme.text.primary}`}>
            {friend.name} 🎁
          </h1>
          <p className={`font-body text-xs ${theme.text.secondary}`}>
            Play the claw machine to reveal your gift!
          </p>
        </div>

        <ClawGame
          gifts={result.suggestions as GiftSuggestion[]}
          theme={theme}
        />
      </div>
    </PixelLayout>
  );
}
