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

  const tagline = `Something ${
    gift.reason.toLowerCase().startsWith("she") ||
    gift.reason.toLowerCase().startsWith("he")
      ? "for someone who" + gift.reason.slice(gift.reason.indexOf(" ") + 1)
      : "that speaks to " + gift.reason.toLowerCase()
  }`.slice(0, 80); // max 80 chars

  return {
    emoji: categoryEmoji[gift.category] ?? "🎁",
    tagline,
    moodTags: categoryMoods[gift.category] ?? ["special", "personal"],
  };
}
