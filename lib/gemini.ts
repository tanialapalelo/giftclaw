import { GoogleGenAI, Type } from "@google/genai";
import type { FriendProfile } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// responseJsonSchema always output with this schema.
// it's different from responseMimeType that only tries to output JSON (could be failed).
// therefore response.text always returns valid JSON, no need for try/catch parse.
const giftResponseSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Gift name" },
          reason: {
            type: Type.STRING,
            description: "Why perfect for this person",
          },
          priceRange: {
            type: Type.STRING,
            description: "Approximate price range",
          },
          category: {
            type: Type.STRING,
            description: "e.g. electronics, books, fashion",
          },
        },
        propertyOrdering: ["name", "reason", "priceRange", "category"],
        required: ["name", "reason", "priceRange", "category"],
      },
    },
  },
  required: ["suggestions"],
};

export async function analyzeGifts(friend: FriendProfile) {
  const budget =
    friend.budgetMin && friend.budgetMax
      ? `Rp${friend.budgetMin.toLocaleString()} - Rp${friend.budgetMax.toLocaleString()}`
      : "flexible";

  const prompt = `Analyze this person's profile and suggest 5 gift ideas.

Profile:
- Name: ${friend.name}
- Interests: ${friend.interests.join(", ")}
- Hobbies: ${friend.hobbies.join(", ")}
- Dislikes: ${friend.dislikes.join(", ")}
- Budget: ${budget}
- Notes: ${friend.notes ?? "none"}

Give practical, specific gifts available in Southeast Asia.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: giftResponseSchema,
      temperature: 0.7,
    },
  });

  return JSON.parse(response.text ?? "{}");
}
