import { z } from "zod";

// Sanitize helper — trim whitespace + strip HTML tags, prevent XSS attack
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

    validUntil: z.string().nullable().optional(),

    // Honeypot — only bots will fill this field, zod validates that it's always an empty string
    _honeypot: z.string().max(0, "Bot detected").default(""),
  })
  // Cross-field validation — requires .superRefine at the object level
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

export type FriendFormData = z.infer<typeof friendSchema>;
