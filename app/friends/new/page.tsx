import Link from "next/link";
import { PixelCard } from "@/components/ui/pixel-card";
import { FriendForm } from "@/components/friend-form";

export const metadata = {
  title: "New Friend — GiftClaw",
};

export default function NewFriendPage() {
  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid px-4 py-12">
      <div className="mx-auto max-w-xl">
        {/* Back */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-700 px-5 py-2 font-pixel text-[9px] uppercase tracking-wider text-gray-400 transition-opacity hover:opacity-70"
          >
            ← HOME
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-pixel text-sm leading-loose text-yellow-400">
            WHO&apos;S THE LUCKY FRIEND?
          </h1>
          <p className="mt-2 font-body text-gray-400">
            Fill in the details & AI will suggest 8 perfect gifts 🎁
          </p>
        </div>

        {/* Form */}
        <PixelCard dark>
          <FriendForm />
        </PixelCard>
      </div>
    </div>
  );
}
