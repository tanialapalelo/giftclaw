import { notFound } from "next/navigation";
import Link from "next/link";
import { getFriend } from "@/lib/actions/friend";
import { THEMES } from "@/lib/themes";
import { PixelLayout } from "@/components/pixel-layout";
import { PixelCard } from "@/components/ui/pixel-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { isValidUUID } from "@/lib/utils";
import { CopyLinkButton } from "@/components/copy-link-button";

export default async function FriendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isValidUUID(id)) notFound();

  const friend = await getFriend(id);

  if (!friend) notFound();

  const themeKey = friend.theme as keyof typeof THEMES;
  const theme = THEMES[themeKey] ?? THEMES.soft;

  return (
    <PixelLayout theme={theme}>
      <div className="space-y-6">
        {/* Header */}
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
          </div>
        </PixelCard>

        <div className={`rounded border p-4 space-y-2 ${theme.machine.frame}`}>
          <p className="font-pixel text-[8px] text-white uppercase tracking-widest">
            🔗 SHARE WITH {friend.name.toUpperCase()}
          </p>
          <p className="font-body text-xs text-white/70">
            Send this link to {friend.name} — they'll play the claw machine to
            reveal their gift. They won't see your budget or notes.
          </p>
          <CopyLinkButton path={`/play/${friend.shareToken}`} />
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link href={`/friends/${id}/gifts`} className="block">
            <PixelButton className="w-full bg-white text-gray-900">
              🎁 SEE GIFT IDEAS
            </PixelButton>
          </Link>

          {/* Edit button — tambah ini */}
          <Link href={`/friends/${id}/edit`} className="block">
            <PixelButton className={`w-full ${theme.machine.frame} text-white`}>
              ✏️ EDIT PROFILE
            </PixelButton>
          </Link>
        </div>

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
