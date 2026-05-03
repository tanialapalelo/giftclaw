export interface FriendProfile {
  id: string;
  shareToken: string;
  name: string;
  interests: string[];
  hobbies: string[];
  dislikes: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  notes: string | null;
  theme: string;
  createdAt: string;
}

export interface GiftSuggestion {
  name: string;
  reason: string;
  priceRange: string;
  category: string;
}

export interface GiftAnalysisResult {
  suggestions: GiftSuggestion[];
  modelVersion: string;
  cached: boolean;
}
