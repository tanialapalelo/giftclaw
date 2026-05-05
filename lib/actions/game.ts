"use server";

import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/utils";
import type { GiftSuggestion } from "@/types";

export type GameResultWithGift = {
  id: string;
  sessionId: string;
  grabIndex: number;
  giftSnapshot: GiftSuggestion;
  createdAt: string;
};

export async function getGameResultsForFriend(
  friendId: string
): Promise<GameResultWithGift[] | null> {
  if (!isValidUUID(friendId)) return null;

  try {
    const results = await prisma.gameResult.findMany({
      where: { friendId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return results.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      grabIndex: r.grabIndex,
      giftSnapshot: r.giftSnapshot as GiftSuggestion,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return null;
  }
}
