"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SavedProfile {
  id: string;
  shareToken: string;
  name: string;
  theme: string;
  createdAt: string;
}

export function saveProfileToLocalStorage(profile: SavedProfile) {
  try {
    const existing = getProfilesFromLocalStorage();
    const updated = [
      profile,
      ...existing.filter((p) => p.id !== profile.id),
    ].slice(0, 5);
    localStorage.setItem("giftclaw_profiles", JSON.stringify(updated));
  } catch {
    // Silent fail — localStorage bisa disabled di private browsing
  }
}

export function getProfilesFromLocalStorage(): SavedProfile[] {
  try {
    const raw = localStorage.getItem("giftclaw_profiles");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const THEME_EMOJI: Record<string, string> = {
  soft: "✨",
  bold: "⚡",
  cute: "🧸",
  classic: "🎪",
};

export function RecentProfiles() {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    setProfiles(getProfilesFromLocalStorage());
  }, []);

  if (profiles.length === 0) return null;

  return (
    <div className="mt-12">
      <p className="mb-4 text-center font-pixel text-[8px] tracking-widest text-gray-500">
        YOUR RECENT PROFILES
      </p>
      <div className="space-y-2">
        {profiles.map((p) => (
          <Link
            key={p.id}
            href={`/friends/${p.id}`}
            className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{THEME_EMOJI[p.theme] ?? "🎁"}</span>
              <span className="font-body text-sm text-gray-300">{p.name}</span>
            </div>
            <span className="font-pixel text-[8px] text-gray-500">PLAY →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
