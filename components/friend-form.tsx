"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFriend } from "@/lib/actions/friend";
import { saveProfileToLocalStorage } from "@/components/recent-profiles";
import { ThemePicker } from "@/components/theme-picker";
import { PixelButton } from "@/components/ui/pixel-button";
import type { ThemeKey } from "@/lib/themes";

function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div>
      <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-700">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-lg border-2 border-gray-300 p-2 focus-within:border-gray-900">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded bg-gray-900 px-2 py-1 font-body text-xs text-white"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-1 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent font-body text-sm outline-none"
        />
      </div>
      <p className="mt-1 font-body text-[10px] text-gray-400">
        Press Enter or comma to add
      </p>
    </div>
  );
}

export function FriendForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState<ThemeKey>("soft");
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      interests,
      hobbies,
      dislikes,
      budgetMin: formData.get("budgetMin")
        ? Number(formData.get("budgetMin"))
        : null,
      budgetMax: formData.get("budgetMax")
        ? Number(formData.get("budgetMax"))
        : null,
      notes: (formData.get("notes") as string) || null,
      theme,
    };

    startTransition(async () => {
      const result = await createFriend(data);

      if ("error" in result) {
        setErrors(result.error as Record<string, string[]>);
        return;
      }

      saveProfileToLocalStorage({
        id: result.id,
        shareToken: result.shareToken,
        name: result.name,
        theme: result.theme,
        createdAt: new Date().toISOString(),
      });

      router.push(`/friends/${result.id}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-700">
          Friend&apos;s Name
        </label>
        <input
          name="name"
          type="text"
          placeholder="e.g. Sarah"
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-body text-sm outline-none focus:border-gray-900"
        />
        {errors.name && (
          <p className="mt-1 font-body text-xs text-red-500">
            {errors.name[0]}
          </p>
        )}
      </div>

      <TagInput
        label="Interests ✦"
        placeholder="e.g. gaming, cooking, music..."
        tags={interests}
        onAdd={(t) => setInterests((prev) => [...prev, t])}
        onRemove={(i) =>
          setInterests((prev) => prev.filter((_, idx) => idx !== i))
        }
      />
      {errors.interests && (
        <p className="-mt-4 font-body text-xs text-red-500">
          {errors.interests[0]}
        </p>
      )}

      <TagInput
        label="Hobbies"
        placeholder="e.g. hiking, reading, coffee..."
        tags={hobbies}
        onAdd={(t) => setHobbies((prev) => [...prev, t])}
        onRemove={(i) =>
          setHobbies((prev) => prev.filter((_, idx) => idx !== i))
        }
      />

      <TagInput
        label="Dislikes (helps AI avoid bad gifts)"
        placeholder="e.g. spicy food, loud music..."
        tags={dislikes}
        onAdd={(t) => setDislikes((prev) => [...prev, t])}
        onRemove={(i) =>
          setDislikes((prev) => prev.filter((_, idx) => idx !== i))
        }
      />

      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-700">
          Budget (IDR)
        </label>
        <div className="flex items-center gap-3">
          <input
            name="budgetMin"
            type="number"
            placeholder="Min e.g. 100000"
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-body text-sm outline-none focus:border-gray-900"
          />
          <span className="font-body text-gray-400">—</span>
          <input
            name="budgetMax"
            type="number"
            placeholder="Max e.g. 500000"
            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-body text-sm outline-none focus:border-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-700">
          Extra Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="e.g. She just got promoted, loves vintage aesthetic..."
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 font-body text-sm outline-none focus:border-gray-900"
        />
      </div>

      <ThemePicker value={theme} onChange={setTheme} />

      <PixelButton
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white hover:bg-gray-700"
      >
        {isPending ? "SAVING..." : "FIND GIFTS ✦"}
      </PixelButton>
    </form>
  );
}
