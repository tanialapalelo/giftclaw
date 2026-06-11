import { describe, it, expect } from "vitest";
import { getVibeFromGift } from "@/lib/vibe";

const makeGift = (category: string, emoji?: string) => ({
  name: "Test Gift",
  reason: "A great gift",
  category,
  emoji,
});

describe("getVibeFromGift", () => {
  it("returns correct emoji for a known category", () => {
    const vibe = getVibeFromGift(makeGift("Books & Stationery"));
    expect(vibe.emoji).toBe("📚");
  });

  it("prefers the gift-specific emoji over the category emoji", () => {
    const vibe = getVibeFromGift(makeGift("Books & Stationery", "📓"));
    expect(vibe.emoji).toBe("📓");
  });

  it("falls back to gift emoji when category emoji is unknown", () => {
    const vibe = getVibeFromGift(makeGift("Unknown Category", "🎯"));
    expect(vibe.emoji).toBe("🎯");
  });

  it("falls back to 🎁 when both gift emoji and category are unknown", () => {
    const vibe = getVibeFromGift(makeGift("Unknown Category"));
    expect(vibe.emoji).toBe("🎁");
  });

  it("returns mood tags for a known category", () => {
    const vibe = getVibeFromGift(makeGift("Food & Drink"));
    expect(vibe.moodTags).toEqual(["cozy", "warm"]);
  });

  it("returns fallback mood tags for unknown category", () => {
    const vibe = getVibeFromGift(makeGift("Unknown Category"));
    expect(vibe.moodTags).toEqual(["special", "personal"]);
  });

  it("returns a non-empty tagline for every known category", () => {
    const categories = [
      "Books & Stationery",
      "Food & Drink",
      "Beauty & Self-care",
      "Tech & Gadgets",
      "Fashion & Accessories",
      "Experience & Activity",
      "Home & Living",
      "Art & Craft",
      "Sports & Fitness",
      "Music & Entertainment",
    ];
    for (const category of categories) {
      const vibe = getVibeFromGift(makeGift(category));
      expect(vibe.tagline.length).toBeGreaterThan(0);
    }
  });

  it("returns fallback tagline for unknown category", () => {
    const vibe = getVibeFromGift(makeGift("Unknown Category"));
    expect(vibe.tagline).toBe("Something special, chosen just for you...");
  });
});
