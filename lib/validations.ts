import { z } from "zod";

export const friendSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  interests: z.array(z.string()).min(1, "Add at least one interest"),
  hobbies: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  budgetMin: z.number().int().positive().nullable(),
  budgetMax: z.number().int().positive().nullable(),
  notes: z.string().max(500).nullable(),
  theme: z.enum(["soft", "bold", "cute", "classic"]).default("soft"),
});

export type FriendFormData = z.infer<typeof friendSchema>;
