import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFriendByShareToken } from "@/lib/actions/friend";
import { getGiftSuggestions } from "@/lib/actions/gift";
import { getGameResultsForFriend } from "@/lib/actions/game";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { isValidUUID } from "@/lib/utils";
import type { GiftSuggestion } from "@/types";
import { PlayClient } from "@/components/play-client";
import { MAX_ATTEMPTS } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}): Promise<Metadata> {
  const { shareToken } = await params;
  if (!isValidUUID(shareToken)) return {};
  const friend = await getFriendByShareToken(shareToken);
  if (!friend) return {};
  return {
    title: `Play for ${friend.name}`,
    description: `Someone prepared a surprise gift for ${friend.name}. Play the claw machine to reveal it!`,
    openGraph: {
      title: `🎁 A gift surprise for ${friend.name}!`,
      description: `Play the claw machine to reveal what gift was chosen for you.`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  if (!isValidUUID(shareToken)) notFound();

  const friend = await getFriendByShareToken(shareToken);
  if (!friend) notFound();

  const theme = THEMES[friend.theme as keyof typeof THEMES] ?? THEMES.bold;

  // Check if link has expired
  const validUntil = friend.validUntil ? new Date(friend.validUntil) : null;
  const isExpired = validUntil !== null && new Date() > validUntil;

  if (isExpired) {
    return (
      <PixelLayout theme={theme}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <div className="text-5xl">🔒</div>
          <p className={`font-pixel text-xs ${theme.text.primary}`}>
            LINK EXPIRED
          </p>
          <p className={`font-body text-sm ${theme.text.secondary}`}>
            This gift link closed on{" "}
            {validUntil.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
            <br />
            The gift-giver has already locked in their purchase!
          </p>
        </div>
      </PixelLayout>
    );
  }

  const gameData = await getGameResultsForFriend(shareToken);
  const alreadyPlayedCount = gameData?.totalCount ?? 0;
  const previousResults = gameData?.results ?? null;

  const result = await getGiftSuggestions(friend.id);

  if ("error" in result) {
    return (
      <PixelLayout theme={theme}>
        <div className="rounded border border-red-200 bg-red-50 p-6 text-center space-y-2">
          <p className="font-pixel text-[10px] text-red-600">
            COULD NOT LOAD GIFTS
          </p>
          <p className="font-body text-sm text-red-500">{result.error}</p>
        </div>
      </PixelLayout>
    );
  }

  return (
    <PixelLayout theme={theme}>
      <PlayClient
        friend={friend}
        theme={theme}
        gifts={result.suggestions as GiftSuggestion[]}
        shareToken={shareToken}
        previousResults={previousResults}
        alreadyPlayedCount={alreadyPlayedCount}
        validUntil={validUntil?.toISOString() ?? null}
        maxAttempts={MAX_ATTEMPTS}
      />
    </PixelLayout>
  );
}
