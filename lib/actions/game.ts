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
  shareToken: string
): Promise<GameResultsResponse> {
  if (!isValidUUID(shareToken)) return null;

  try {
    const friend = await prisma.friend.findUnique({
      where: { shareToken },
      select: { id: true },
    });
    if (!friend) return null;

    const [results, totalCount] = await Promise.all([
      prisma.gameResult.findMany({
        where: { friendId: friend.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.gameResult.count({ where: { friendId: friend.id } }),
    ]);

    return {
      results: results.map((r) => ({
        id: r.id,
        sessionId: r.sessionId,
        grabIndex: r.grabIndex,
        // Prisma Json fields come back as JsonValue; cast through unknown to our typed interface
        giftSnapshot: r.giftSnapshot as unknown as GiftSuggestion,
        createdAt: r.createdAt.toISOString(),
      })),
      totalCount,
    };
  } catch {
    return null;
  }
}
