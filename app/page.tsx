import Link from "next/link";
import { getAllFriends } from "@/lib/actions/friend";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelCard } from "@/components/ui/pixel-card";
import { THEMES } from "@/lib/themes";

export default async function HomePage() {
  const friends = await getAllFriends();

  return (
    <div className="min-h-screen bg-gray-900 bg-pixel-grid">
      <div className="mx-auto max-w-xl px-4 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 animate-float inline-block text-5xl">🕹️</div>
          <h1 className="font-pixel text-xl leading-loose text-white">
            GIFT CLAW
          </h1>
          <p className="mt-4 font-body text-gray-400">
            AI-powered gift suggestions. Play a pixel claw machine to reveal
            them
          </p>
          <div className="mt-8">
            <Link href="/friends/new">
              <PixelButton className="bg-yellow-400 text-gray-900 hover:bg-yellow-300">
                ✦ FIND A GIFT ✦
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* Recent Friends */}
        {friends.length > 0 && (
          <div>
            <p className="mb-4 font-pixel text-[9px] uppercase tracking-widest text-gray-500">
              Recent Profiles
            </p>
            <div className="space-y-3">
              {friends.map((friend) => {
                const themeKey = friend.theme as keyof typeof THEMES;
                const theme = THEMES[themeKey] ?? THEMES.soft;
                return (
                  <Link key={friend.id} href={`/friends/${friend.id}`}>
                    <PixelCard className="flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{theme.prize.emoji}</span>
                        <div>
                          <p className="font-pixel text-[10px] text-gray-900">
                            {friend.name}
                          </p>
                          <p className="font-body text-xs text-gray-400">
                            {theme.label}
                          </p>
                        </div>
                      </div>
                      <span className="font-body text-xs text-gray-400">→</span>
                    </PixelCard>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
