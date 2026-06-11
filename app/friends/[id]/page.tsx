import { notFound } from "next/navigation";
import Link from "next/link";
import { getFriend } from "@/lib/actions/friend";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { PixelCard } from "@/components/ui/pixel-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { isValidUUID } from "@/lib/utils";
import { CopyLinkButton } from "@/components/copy-link-button";
import { getGameResultsForFriend } from "@/lib/actions/game";
import { getVibeFromGift } from "@/lib/vibe";
import { MAX_ATTEMPTS } from "@/lib/constants";

export default async function FriendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isValidUUID(id)) notFound();

  const friend = await getFriend(id);
  if (!friend) notFound();

  const gameData = await getGameResultsForFriend(friend.shareToken);
  const gameResults = gameData?.results ?? [];
  const totalPlays = gameData?.totalCount ?? 0;
  const hasResults = totalPlays > 0;

  const themeKey = friend.theme as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES.bold;

  const validUntil = friend.validUntil ? new Date(friend.validUntil) : null;
  const deadlineText = validUntil
    ? validUntil.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const isExpired = validUntil !== null && new Date() > validUntil;

  return (
    <PixelLayout theme={theme}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p
            className={`font-pixel text-[8px] uppercase tracking-widest ${theme.text.secondary}`}
          >
            Gift Profile
          </p>
          <h1 className={`mt-2 font-pixel text-lg ${theme.text.primary}`}>
            {friend.name}
          </h1>
          <p className={`mt-1 font-body text-sm ${theme.text.secondary}`}>
            {theme.label}
          </p>
        </div>

        {/* Profile Card */}
        <PixelCard>
          <div className="space-y-4">
            <ProfileRow label="✦ Interests" tags={friend.interests} />
            <ProfileRow label="🎮 Hobbies" tags={friend.hobbies} />
            <ProfileRow label="✕ Dislikes" tags={friend.dislikes} />

            {(friend.budgetMin || friend.budgetMax) && (
              <div>
                <p className="font-pixel text-[9px] uppercase text-gray-500">
                  💰 Budget
                </p>
                <p className="mt-1 font-body text-sm text-gray-700">
                  {friend.budgetMin
                    ? `IDR ${friend.budgetMin.toLocaleString("id-ID")}`
                    : "Any"}{" "}
                  —{" "}
                  {friend.budgetMax
                    ? `IDR ${friend.budgetMax.toLocaleString("id-ID")}`
                    : "Any"}
                </p>
              </div>
            )}

            {friend.notes && (
              <div>
                <p className="font-pixel text-[9px] uppercase text-gray-500">
                  📝 Notes
                </p>
                <p className="mt-1 font-body text-sm text-gray-700">
                  {friend.notes}
                </p>
              </div>
            )}

            {deadlineText && (
              <div>
                <p className="font-pixel text-[9px] uppercase text-gray-500">
                  ⏰ Link Closes
                </p>
                <p
                  className={`mt-1 font-body text-sm ${
                    isExpired ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {deadlineText} {isExpired && "— EXPIRED"}
                </p>
              </div>
            )}
          </div>
        </PixelCard>

        {/* ── NEXT STEPS (numbered, clear flow) ── */}
        {!hasResults && (
          <div
            className={`rounded-lg border-2 p-4 space-y-3 ${theme.machine.frame}`}
          >
            <p className="font-pixel text-[8px] text-white uppercase tracking-widest">
              🗺 NEXT STEPS
            </p>
            <div className="space-y-2">
              {[
                {
                  n: "1",
                  label: "Preview Gift Ideas",
                  desc: "See what AI suggested for " + friend.name,
                  href: `/friends/${id}/gifts`,
                  done: false,
                },
                {
                  n: "2",
                  label: "Copy & Send the Link",
                  desc: "Share the play link with " + friend.name,
                  href: null,
                  done: false,
                },
                {
                  n: "3",
                  label: "Wait for " + friend.name + " to Play",
                  desc: `They pick up to ${MAX_ATTEMPTS} vibes — results appear below`,
                  href: null,
                  done: false,
                },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 font-pixel text-[9px] text-white">
                    {step.n}
                  </div>
                  <div className="flex-1">
                    {step.href ? (
                      <Link
                        href={step.href}
                        className="font-pixel text-[9px] text-white underline underline-offset-2"
                      >
                        {step.label}
                      </Link>
                    ) : (
                      <p className="font-pixel text-[9px] text-white">
                        {step.label}
                      </p>
                    )}
                    <p className="font-body text-[10px] text-white/60">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="space-y-3">
          {/* Step 1 — always visible */}
          <Link href={`/friends/${id}/gifts`} className="block">
            <PixelButton className="w-full bg-white text-gray-900">
              🎁 {hasResults ? "SEE GIFT IDEAS" : "STEP 1 — PREVIEW GIFT IDEAS"}
            </PixelButton>
          </Link>

          {/* Step 2 — copy link, prominent */}
          <div
            className={`rounded-lg border-2 p-4 space-y-2 ${theme.machine.frame}`}
          >
            <p className="font-pixel text-[8px] text-white uppercase tracking-widest">
              {hasResults
                ? "🔗 SHARE LINK"
                : "STEP 2 — SEND THIS TO " + friend.name.toUpperCase()}
            </p>
            <p className="font-body text-xs text-white/70">
              {hasResults
                ? `${friend.name} can still play if they haven't used all 3 attempts.`
                : `${friend.name} will play the claw machine — they won't see your budget or notes.`}
            </p>
            {isExpired ? (
              <p className="font-pixel text-[8px] text-red-300">
                ⚠ LINK HAS EXPIRED
              </p>
            ) : (
              <CopyLinkButton path={`/play/${friend.shareToken}`} />
            )}
          </div>

          <Link href={`/friends/${id}/edit`} className="block">
            <PixelButton className={`w-full ${theme.machine.frame} text-white`}>
              ✏️ EDIT PROFILE
            </PixelButton>
          </Link>
        </div>

        {/* ── RESULTS ── */}
        {hasResults && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <p
                className={`font-pixel text-[8px] tracking-widest ${theme.text.secondary}`}
              >
                {friend.name.toUpperCase()} PLAYED ({totalPlays}/{MAX_ATTEMPTS})
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p
              className={`font-body text-xs text-center ${theme.text.secondary}`}
            >
              {friend.name} grabbed {totalPlays} gift
              {totalPlays > 1 ? "s" : ""} — here&apos;s what to buy:
            </p>

            {gameResults.map((result) => {
              const vibe = getVibeFromGift(result.giftSnapshot);
              return (
                <div
                  key={result.id}
                  className={`rounded-lg border-2 p-4 space-y-2 ${theme.prize.box}`}
                >
                  {/* Grab number */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-pixel text-[7px] ${theme.text.secondary}`}
                    >
                      GRAB {result.grabIndex}
                    </span>
                    <span className="text-lg">{vibe.emoji}</span>
                    <div className="flex gap-1 ml-auto">
                      {vibe.moodTags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2 py-0.5 font-body text-[10px] bg-black/10 ${theme.text.secondary}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* What the player saw (the clue) */}
                  <div
                    className={`rounded p-2 bg-black/5 border border-black/10`}
                  >
                    <p
                      className={`font-pixel text-[7px] mb-1 ${theme.text.secondary}`}
                    >
                      CLUE {friend.name.toUpperCase()} SAW:
                    </p>
                    <p
                      className={`font-body text-xs italic leading-relaxed ${theme.text.secondary}`}
                    >
                      &ldquo;{vibe.tagline}&rdquo;
                    </p>
                  </div>

                  {/* Actual gift to buy */}
                  <div>
                    <p
                      className={`font-pixel text-[7px] mb-1 ${theme.text.secondary}`}
                    >
                      GIFT TO BUY:
                    </p>
                    <p
                      className={`font-pixel text-[9px] leading-relaxed ${theme.text.primary}`}
                    >
                      {result.giftSnapshot.name}
                    </p>
                    <p
                      className={`font-body text-xs mt-0.5 ${theme.text.secondary}`}
                    >
                      {result.giftSnapshot.priceRange} ·{" "}
                      {result.giftSnapshot.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!hasResults && (
          <div
            className={`rounded border p-4 text-center space-y-1 border-dashed ${theme.text.secondary}`}
          >
            <p className="font-pixel text-[8px]">
              WAITING FOR {friend.name.toUpperCase()} TO PLAY
            </p>
            <p className="font-body text-xs">
              Results appear here once they use the link
            </p>
          </div>
        )}

        {/* Back */}
        <div className="text-center">
          <Link
            href="/"
            className="font-body text-xs text-gray-400 hover:text-gray-600"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </PixelLayout>
  );
}

function ProfileRow({ label, tags }: { label: string; tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div>
      <p className="font-pixel text-[9px] uppercase text-gray-500">{label}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="rounded bg-gray-100 px-2 py-1 font-body text-xs text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
