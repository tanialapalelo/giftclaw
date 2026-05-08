"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { friendSchema } from "@/lib/validations";
import { isValidUUID } from "@/lib/utils";

export async function createFriend(formData: unknown) {
  // 1. Validate
  const parsed = friendSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data._honeypot !== "") {
    return { error: "BOT_DETECTED" };
  }

  // 2. Save to DB
  const friend = await prisma.friend.create({
    data: {
      name: parsed.data.name,
      interests: parsed.data.interests,
      hobbies: parsed.data.hobbies,
      dislikes: parsed.data.dislikes,
      budgetMin: parsed.data.budgetMin,
      budgetMax: parsed.data.budgetMax,
      notes: parsed.data.notes,
      theme: parsed.data.theme,
      validUntil: parsed.data.validUntil
        ? new Date(parsed.data.validUntil)
        : null,
    },
  });

  revalidatePath("/");

  return {
    id: friend.id,
    name: friend.name,
    theme: parsed.data.theme,
    shareToken: friend.shareToken,
  };
}

export async function getFriend(id: string) {
  if (!isValidUUID(id)) return null;
  try {
    const friend = await prisma.friend.findUnique({
      where: { id },
    });

    if (!friend) return null;

    return {
      ...friend,
      createdAt: friend.createdAt.toISOString(),
      updatedAt: friend.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getFriendByShareToken(shareToken: string) {
  try {
    const friend = await prisma.friend.findUnique({
      where: { shareToken },
      select: {
        id: true,
        name: true,
        theme: true,
        shareToken: true,
        interests: true,
        hobbies: true,
        validUntil: true,
      },
    });
    return friend;
  } catch (error) {
    return null;
  }
}

export async function updateFriend(id: string, formData: unknown) {
  if (!isValidUUID(id)) return { error: "Invalid ID" };

  const parsed = friendSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const friend = await prisma.friend.update({
    where: { id },
    data: {
      name: parsed.data.name,
      interests: parsed.data.interests,
      hobbies: parsed.data.hobbies,
      dislikes: parsed.data.dislikes,
      budgetMin: parsed.data.budgetMin,
      budgetMax: parsed.data.budgetMax,
      notes: parsed.data.notes,
      theme: parsed.data.theme,
      validUntil: parsed.data.validUntil
        ? new Date(parsed.data.validUntil)
        : null,
    },
  });

  await prisma.giftSuggestion.deleteMany({
    where: { friendId: id },
  });

  revalidatePath(`/friends/${id}`);
  revalidatePath(`/play/${friend.shareToken}`);

  return {
    id: friend.id,
    name: friend.name,
    theme: friend.theme,
    shareToken: friend.shareToken,
  };
}
