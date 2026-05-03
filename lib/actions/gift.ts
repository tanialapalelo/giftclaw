"use server";

import { prisma } from "@/lib/prisma";
import { analyzeGifts } from "@/lib/gemini";
import { rateLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { FriendProfile } from "@/types";

export async function getGiftSuggestions(friendId: string) {
  // 1. Cek cache di DB dulu
  const cached = await prisma.giftSuggestion.findFirst({
    where: { friendId },
    orderBy: { createdAt: "desc" },
  });

  if (cached) {
    return {
      suggestions: cached.suggestions as any,
      modelVersion: cached.modelVersion,
      cached: true,
    };
  }

  // 2. Rate limit check per IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "anonymous";

  const { success, limit, remaining } = await rateLimiter.limit(ip);

  if (!success) {
    return {
      error: `Rate limit exceeded. Try again in a minute.`,
      limit,
      remaining,
    };
  }

  // 3. Ambil friend profile
  const friend = await prisma.friend.findUnique({
    where: { id: friendId },
  });

  if (!friend) {
    return { error: "Friend not found" };
  }

  const friendProfile: FriendProfile = {
    id: friend.id,
    shareToken: friend.shareToken,
    name: friend.name,
    interests: friend.interests,
    hobbies: friend.hobbies,
    dislikes: friend.dislikes,
    budgetMin: friend.budgetMin,
    budgetMax: friend.budgetMax,
    notes: friend.notes,
    theme: friend.theme,
    createdAt: friend.createdAt.toISOString(),
  };

  // 4. Call Gemini AI
  const result = await analyzeGifts(friendProfile);

  // 5. Simpan ke DB (cache)
  await prisma.giftSuggestion.create({
    data: {
      friendId,
      suggestions: result.suggestions,
      modelVersion: "gemini-2.5-flash",
    },
  });

  return {
    suggestions: result.suggestions,
    modelVersion: "gemini-2.5-flash",
    cached: false,
  };
}
