import { z } from "zod";

// Sanitize helper, trim whitespace + strip HTML tags, prevent XSS attack
const sanitizedString = (max: number) =>
  z
    .string()
    .max(max)
    .transform((s) => s.trim().replace(/<[^>]*>/g, ""));

const sanitizedTag = sanitizedString(50);

export const friendSchema = z
  .object({
    name: sanitizedString(50).pipe(z.string().min(1, "Name is required")),

    interests: z
      .array(sanitizedTag)
      .min(1, "Add at least one interest")
      .max(10, "Maximum 10 interests"),

    hobbies: z.array(sanitizedTag).max(10, "Maximum 10 hobbies").default([]),

    dislikes: z.array(sanitizedTag).max(10, "Maximum 10 dislikes").default([]),

    budgetMin: z.number().int().positive().max(100_000_000).nullish(),
    budgetMax: z.number().int().positive().max(100_000_000).nullish(),

    notes: sanitizedString(500).nullish(),

    theme: z.enum(["soft", "bold", "cute", "classic"]).default("soft"),

    currency: z.enum(["IDR", "USD", "SGD", "MYR", "EUR", "GBP"]).default("IDR"),

    // Date-only YYYY-MM-DD from <input type="date">; anything else would
    // reach new Date() as "Invalid Date" and crash the Prisma write
    validUntil: z.iso.date("Enter a valid date").nullish(),

    // Honeypot, only bots will fill this field, zod validates that it's always an empty string
    _honeypot: z.string().max(0, "Bot detected").default(""),
  })
  // Cross-field validation, requires .superRefine at the object level
  .superRefine((data, ctx) => {
    if (
      data.budgetMin != null && // != null covers both null AND undefined
      data.budgetMax != null &&
      data.budgetMin > data.budgetMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Min budget cannot exceed max budget",
        path: ["budgetMin"],
      });
    }
  });

// Earliest validUntil accepted when creating a friend. The server runs in
// UTC but the date picker uses the giver's local "today", which can be up to
// a day behind UTC (e.g. UTC-10 in the evening), so allow yesterday-in-UTC
// to avoid rejecting a legitimate "today" from those time zones.
export function earliestValidUntil(now: Date = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export type FriendFormData = z.infer<typeof friendSchema>;
