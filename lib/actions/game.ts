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

export type GameResultsResponse = {
  results: GameResultWithGift[];
  totalCount: number;
} | null;

export async function getGameResultsForFriend(
  friendId: string
): Promise<GameResultsResponse> {
  if (!isValidUUID(friendId)) return null;

  try {
    const [results, totalCount] = await Promise.all([
      prisma.gameResult.findMany({
        where: { friendId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.gameResult.count({ where: { friendId } }),
    ]);

    return {
      results: results.map((r: (typeof results)[number]) => ({
        id: r.id,
        sessionId: r.sessionId,
        grabIndex: r.grabIndex,
        giftSnapshot: r.giftSnapshot as unknown as GiftSuggestion,
        createdAt: r.createdAt.toISOString(),
      })),
      totalCount,
    };
  } catch {
    return null;
  }
}
