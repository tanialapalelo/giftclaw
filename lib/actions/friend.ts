"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

  // 3. Redirect to friend page
  revalidatePath("/");
  redirect(`/friends/${friend.id}`);
}

export async function getFriend(id: string) {
  const friend = await prisma.friend.findUnique({
    where: { id },
  });

  if (!friend) return null;

  return {
    ...friend,
    createdAt: friend.createdAt.toISOString(),
    updatedAt: friend.updatedAt.toISOString(),
  };
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
