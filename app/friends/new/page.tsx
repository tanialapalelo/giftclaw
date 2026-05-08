import { PixelCard } from "@/components/ui/pixel-card";
import { FriendForm } from "@/components/friend-form";

export const metadata = {
  title: "New Friend — GiftClaw",
};

export default function NewFriendPage() {
  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid px-4 py-12">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-pixel text-sm leading-loose text-yellow-400">
            WHO&apos;S THE LUCKY FRIEND?
          </h1>
          <p className="mt-2 font-body text-gray-400">
            Fill in the details — AI will suggest 5 perfect gifts 🎁
          </p>
        </div>

        {/* Form */}
        <PixelCard>
          <FriendForm />
        </PixelCard>
      </div>
    </div>
  );
}
