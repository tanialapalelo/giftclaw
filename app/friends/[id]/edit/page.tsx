import { notFound } from "next/navigation";
import { getFriend } from "@/lib/actions/friend";
import { PixelCard } from "@/components/ui/pixel-card";
import { FriendForm } from "@/components/friend-form";
import { isValidUUID } from "@/lib/utils";
import type { ThemeKey } from "@/lib/themes";

export default async function EditFriendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isValidUUID(id)) notFound();

  const friend = await getFriend(id);
  if (!friend) notFound();

  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="font-pixel text-sm leading-loose text-yellow-400">
            EDIT PROFILE
          </h1>
          <p className="mt-2 font-body text-gray-400">
            Update {friend.name}&apos;s details — gifts will regenerate
            automatically 🎁
          </p>
        </div>

        <PixelCard dark>
          <FriendForm
            friendId={id}
            initialData={{
              name: friend.name,
              interests: friend.interests,
              hobbies: friend.hobbies,
              dislikes: friend.dislikes,
              budgetMin: friend.budgetMin,
              budgetMax: friend.budgetMax,
              notes: friend.notes,
              theme: friend.theme as ThemeKey,
              currency: friend.currency,
              validUntil: friend.validUntil,
            }}
          />
        </PixelCard>
      </div>
    </div>
  );
}
