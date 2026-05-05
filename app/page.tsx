import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecentProfiles } from "@/components/recent-profiles";
import { PixelButton } from "@/components/ui/pixel-button";

export const dynamic = "force-dynamic";

async function getTotalCount() {
  try {
    return await prisma.friend.count();
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const totalCount = await getTotalCount();

  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid overflow-hidden">
      {/* Scanline overlay all page — subtle CRT feel */}
      <div className="pointer-events-none fixed inset-0 z-50 crt-overlay opacity-30" />

      <div className="relative mx-auto max-w-lg px-4 py-12">
        {/* ── MARQUEE TICKER ── */}
        <div className="mb-8 overflow-hidden border border-yellow-400/30 bg-yellow-400/5 py-2">
          <p className="animate-marquee whitespace-nowrap font-pixel text-[8px] text-yellow-400">
            ★ INSERT COIN TO PLAY &nbsp;&nbsp;&nbsp; ★ AI POWERED GIFT FINDER
            &nbsp;&nbsp;&nbsp; ★ 4 THEMES AVAILABLE &nbsp;&nbsp;&nbsp; ★ NO
            LOGIN REQUIRED &nbsp;&nbsp;&nbsp; ★ FREE TO PLAY &nbsp;&nbsp;&nbsp;
          </p>
        </div>

        {/* ── HERO ── */}
        <div className="text-center space-y-4">
          {/* Fallback: emoji animate float */}
          <div className="relative inline-block">
            {/* later will try with Kenney sprite, for now just emoji
                <Image
                  src="/assets/kenney/ui/panel_blue.png"
                  width={80} height={80}
                  alt="arcade cabinet"
                  className="pixel-render animate-float mx-auto"
                /> 
            */}
            <div className="animate-float inline-block text-6xl">🕹️</div>

            {/* Pixel sparkles around icon */}
            <span className="absolute -top-2 -right-2 animate-blink font-pixel text-[8px] text-yellow-400">
              ✦
            </span>
            <span
              className="absolute -bottom-1 -left-3 animate-blink font-pixel text-[8px] text-pink-400"
              style={{ animationDelay: "0.5s" }}
            >
              ★
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-pixel text-3xl leading-relaxed text-white">
              GIFT{" "}
              <span className="text-yellow-400 neon-yellow animate-neon">
                CLAW
              </span>
            </h1>
            <p className="mt-1 font-pixel text-[8px] tracking-widest text-gray-500">
              — ARCADE EDITION —
            </p>
          </div>

          <p className="font-body text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Tell us about your friend → AI suggests 8 personalized gifts → Play
            claw machine to reveal one
          </p>

          {/* Social proof counter — anonymous, no one's data exposed */}
          {totalCount > 0 && (
            <div className="inline-block rounded border border-yellow-400/20 bg-yellow-400/5 px-4 py-2">
              <span className="font-pixel text-[8px] text-yellow-400">
                🎁 {totalCount.toLocaleString()} GIFTS DISCOVERED
              </span>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="mt-8 text-center">
          <Link href="/friends/new">
            <PixelButton className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-12 py-4 text-sm">
              🕹️ &nbsp;FIND A GIFT
            </PixelButton>
          </Link>
          <p className="mt-3 font-pixel text-[7px] text-gray-600">
            FREE · NO LOGIN · NO ADS
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="mt-14">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <p className="font-pixel text-[8px] tracking-widest text-gray-500">
              HOW TO PLAY
            </p>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            {[
              {
                step: "01",
                icon: "📝",
                title: "FILL PROFILE",
                desc: "Tell us your friend's interests, hobbies, and budget",
              },
              {
                step: "02",
                icon: "🤖",
                title: "AI ANALYZES",
                desc: "Gemini AI generates 8 personalized gift ideas",
              },
              {
                step: "03",
                icon: "🕹️",
                title: "SHARE & PLAY",
                desc: "Share the claw machine link — your friend plays to reveal",
              },
              {
                step: "04",
                icon: "🎁",
                title: "GIFT REVEALED",
                desc: "Mystery box opens with the perfect gift suggestion",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded border border-white/5 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]"
              >
                {/* Step number — pixel style */}
                <span className="w-8 shrink-0 font-pixel text-[10px] text-yellow-400">
                  {step}
                </span>

                {/* Icon — swap dengan Kenney sprite nanti */}
                <span className="text-xl">{icon}</span>

                {/* Text */}
                <div className="flex-1">
                  <p className="font-pixel text-[8px] text-white">{title}</p>
                  <p className="font-body text-xs text-gray-500 mt-0.5">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THEMES PREVIEW ── */}
        <div className="mt-14">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <p className="font-pixel text-[8px] tracking-widest text-gray-500">
              4 THEMES
            </p>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              {
                emoji: "🎀",
                label: "SOFT",
                color: "border-pink-400/40 bg-pink-400/5",
              },
              {
                emoji: "⚡",
                label: "BOLD",
                color: "border-cyan-400/40 bg-cyan-400/5",
              },
              {
                emoji: "🧸",
                label: "CUTE",
                color: "border-purple-400/40 bg-purple-400/5",
              },
              {
                emoji: "🎪",
                label: "ARCADE",
                color: "border-yellow-400/40 bg-yellow-400/5",
              },
            ].map(({ emoji, label, color }) => (
              <div
                key={label}
                className={`rounded border px-2 py-3 text-center ${color}`}
              >
                <div className="text-2xl">{emoji}</div>
                <p className="mt-1 font-pixel text-[6px] text-gray-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECENT PROFILES (localStorage only) ── */}
        <RecentProfiles />

        {/* ── FOOTER ── */}
        <div className="mt-16 text-center space-y-1">
          <p className="font-pixel text-[7px] text-gray-700">
            BUILT WITH ♥ FOR GIFTING SEASON
          </p>
          <p className="font-pixel text-[7px] text-gray-700">
            ASSETS BY KENNEY.NL (CC0)
          </p>
        </div>
      </div>
    </div>
  );
}
