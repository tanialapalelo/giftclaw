export function getVibeFromGift(gift: {
  name: string;
  reason: string;
  category: string;
  emoji?: string;
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

  // Mystery vibe taglines — mood-based, never names the gift
  const categoryVibes: Record<string, string> = {
    "Books & Stationery":
      "Something that opens a world you haven't explored yet...",
    "Food & Drink": "Something warm, comforting, and made for slow moments...",
    "Beauty & Self-care":
      "Something that says: you deserve to feel good today...",
    "Tech & Gadgets":
      "Something sharp, modern, and built for your curiosity...",
    "Fashion & Accessories":
      "Something that lets you show the world who you are...",
    "Experience & Activity":
      "Something to be lived, not owned — an adventure awaits...",
    "Home & Living":
      "Something that makes your space feel a little more like you...",
    "Art & Craft": "Something for the hands and heart of a creator...",
    "Sports & Fitness":
      "Something to push further, go harder, and feel alive...",
    "Music & Entertainment":
      "Something to fill the air with joy and good vibes...",
  };

  const tagline =
    categoryVibes[gift.category] ?? "Something special, chosen just for you...";

  return {
    emoji: gift.emoji ?? categoryEmoji[gift.category] ?? "🎁",
    tagline,
    moodTags: categoryMoods[gift.category] ?? ["special", "personal"],
  };
}
