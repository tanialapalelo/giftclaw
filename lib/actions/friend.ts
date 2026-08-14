"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { friendSchema, type FriendFormData } from "@/lib/validations";
import { isValidUUID } from "@/lib/utils";
import type { Friend } from "@prisma/client";

// Fields that feed the Gemini prompt / affect which gifts get suggested.
// Anything else (name, theme, validUntil) is cosmetic and safe to edit
// even after the friend has started playing.
const GIFT_RELEVANT_FIELDS = [
  "interests",
  "hobbies",
  "dislikes",
  "budgetMin",
  "budgetMax",
  "notes",
  "currency",
] as const satisfies readonly (keyof Friend & keyof FriendFormData)[];

// `current` is the value already stored in the DB for one gift-relevant
// field; `next` is the freshly-parsed form value for that same field.
// Tag lists (interests/hobbies/dislikes) count as unchanged if they contain
// the same tags regardless of order, since reordering doesn't affect gift
// relevance and the form always submits a fresh array instance anyway.
function isFieldChanged(current: unknown, next: unknown): boolean {
  const a = current ?? null;
  const b = next ?? null;

  if (Array.isArray(a) || Array.isArray(b)) {
    const sortedA = Array.isArray(a) ? [...a].sort() : [];
    const sortedB = Array.isArray(b) ? [...b].sort() : [];
    if (sortedA.length !== sortedB.length) return true;
    return sortedA.some((v, i) => v !== sortedB[i]);
  }

  return a !== b;
}

export async function createFriend(formData: unknown) {
  // Validate and sanitize input via Zod schema
  const parsed = friendSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data._honeypot !== "") {
    return { error: "BOT_DETECTED" };
  }

  // Persist to DB
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
      currency: parsed.data.currency,
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
  } catch {
    return null;
  }
}

export async function updateFriend(id: string, formData: unknown) {
  if (!isValidUUID(id)) return { error: "Invalid ID" };

  const parsed = friendSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const current = await prisma.friend.findUnique({ where: { id } });
  if (!current) return { error: "Invalid ID" };

  const giftFieldsChanged = GIFT_RELEVANT_FIELDS.some((field) =>
    isFieldChanged(current[field], parsed.data[field])
  );

  if (giftFieldsChanged) {
    const playCount = await prisma.gameResult.count({
      where: { friendId: id },
    });
    if (playCount > 0) {
      return {
        error:
          "Can't change gift details after your friend has started playing. You can still update the theme or deadline.",
      };
    }
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
      currency: parsed.data.currency,
      validUntil: parsed.data.validUntil
        ? new Date(parsed.data.validUntil)
        : null,
    },
  });

  if (giftFieldsChanged) {
    await prisma.giftSuggestion.deleteMany({
      where: { friendId: id },
    });
  }

  revalidatePath(`/friends/${id}`);
  revalidatePath(`/play/${friend.shareToken}`);

  return {
    id: friend.id,
    name: friend.name,
    theme: friend.theme,
    shareToken: friend.shareToken,
  };
}
