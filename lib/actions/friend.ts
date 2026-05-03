"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { friendSchema } from "@/lib/validations";

export async function createFriend(formData: unknown) {
  // 1. Validate
  const parsed = friendSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
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

export async function getAllFriends() {
  const friends = await prisma.friend.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      theme: true,
      createdAt: true,
    },
  });

  return friends.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));
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
      },
    });
    return friend;
  } catch (error) {
    console.error("Error fetching friend by share token:", error);
  }
}
