export function getVibeFromGift(gift: {
  name: string;
  reason: string;
  category: string;
}): {
  emoji: string;
  tagline: string;
  moodTags: string[];
} {
  // Map category → emoji
  const categoryEmoji: Record<string, string> = {
    "Books & Stationery": "📚",
    "Food & Drink": "🍜",
    "Beauty & Self-care": "✨",
    "Tech & Gadgets": "💻",
    "Fashion & Accessories": "🎀",
    "Experience & Activity": "🎪",
    "Home & Living": "🏡",
    "Art & Craft": "🎨",
    "Sports & Fitness": "⚡",
    "Music & Entertainment": "🎵",
  };

  // Map category → mood tags
  const categoryMoods: Record<string, string[]> = {
    "Books & Stationery": ["curious", "thoughtful"],
    "Food & Drink": ["cozy", "warm"],
    "Beauty & Self-care": ["gentle", "nurturing"],
    "Tech & Gadgets": ["bold", "modern"],
    "Fashion & Accessories": ["expressive", "stylish"],
    "Experience & Activity": ["adventurous", "playful"],
    "Home & Living": ["peaceful", "homey"],
    "Art & Craft": ["creative", "expressive"],
    "Sports & Fitness": ["energetic", "driven"],
    "Music & Entertainment": ["joyful", "vibrant"],
  };

  // Use the AI's reason directly as the tagline — length is controlled in the prompt.
  const tagline = gift.reason;

  return {
    emoji: categoryEmoji[gift.category] ?? "🎁",
    tagline,
    moodTags: categoryMoods[gift.category] ?? ["special", "personal"],
  };
}
