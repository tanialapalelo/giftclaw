import { notFound } from "next/navigation";
import { getFriendByShareToken } from "@/lib/actions/friend";
import { getGiftSuggestions } from "@/lib/actions/gift";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { isValidUUID } from "@/lib/utils";
import type { GiftSuggestion } from "@/types";
import { PlayClient } from "@/components/play-client";

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
        friendId={friend.id}
      />
    </PixelLayout>
  );
}
