"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  earliestValidUntil,
  friendSchema,
  type FriendFormData,
} from "@/lib/validations";
import { isValidUUID } from "@/lib/utils";
import { taintObjectReference } from "@/lib/taint";
import { checkRateLimit } from "@/lib/rate-limit";
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

  // Past deadlines are only rejected on create; an edit may legitimately
  // resubmit a deadline that has since passed
  if (parsed.data.validUntil && parsed.data.validUntil < earliestValidUntil()) {
    return { error: { validUntil: ["Deadline can't be in the past"] } };
  }

  // Checked after validation so malformed submissions don't burn the budget
  const rateLimit = await checkRateLimit("createFriend");
  if (!rateLimit.success) {
    return { error: "Too many profiles created. Try again later." };
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

// Receiver-facing lookup. Never select `id` here: it is the giver's private
// capability, and anything this returns can end up in the play page's RSC
// payload. Use getGiftSuggestionsByShareToken for data keyed by friend id.
export async function getFriendByShareToken(shareToken: string) {
  try {
    const friend = await prisma.friend.findUnique({
      where: { shareToken },
      select: {
        name: true,
        theme: true,
        shareToken: true,
        interests: true,
        hobbies: true,
        validUntil: true,
      },
    });
    // Backstop: React refuses to serialize this object to a client
    // component, so callers must pick fields into an explicit DTO
    if (friend) {
      taintObjectReference(
        "Do not pass the share-token friend row to the client. Pick the fields the client needs.",
        friend
      );
    }
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

  const rateLimit = await checkRateLimit("updateFriend");
  if (!rateLimit.success) {
    return { error: "Too many edits. Try again later." };
  }

  // Check, update, and cache-delete as one unit under the same friend row
  // lock saveGameResult takes, so a grab can't land between the play-count
  // check and the cache delete and leave the receiver mid-game with a
  // deleted prize pool.
  const outcome = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM friends WHERE id = ${id}::uuid FOR UPDATE`;

    const current = await tx.friend.findUnique({ where: { id } });
    if (!current) return { error: "Invalid ID" } as const;

    const giftFieldsChanged = GIFT_RELEVANT_FIELDS.some((field) =>
      isFieldChanged(current[field], parsed.data[field])
    );

    if (giftFieldsChanged) {
      const playCount = await tx.gameResult.count({
        where: { friendId: id },
      });
      if (playCount > 0) {
        return {
          error:
            "Can't change gift details after your friend has started playing. You can still update the theme or deadline.",
        } as const;
      }
    }

    const friend = await tx.friend.update({
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
      await tx.giftSuggestion.deleteMany({
        where: { friendId: id },
      });
    }

    return { friend, giftFieldsChanged };
  });

  if ("error" in outcome) return { error: outcome.error };
  const { friend, giftFieldsChanged } = outcome;

  revalidatePath(`/friends/${id}`);
  revalidatePath(`/play/${friend.shareToken}`);

  return {
    id: friend.id,
    name: friend.name,
    theme: friend.theme,
    shareToken: friend.shareToken,
    regenerated: giftFieldsChanged,
  };
}
