"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFriend, updateFriend } from "@/lib/actions/friend";
import { saveProfileToLocalStorage } from "@/components/recent-profiles";
import { ThemePicker } from "@/components/theme-picker";
import { PixelButton } from "@/components/ui/pixel-button";
import type { ThemeKey } from "@/lib/themes";
import { CURRENCIES } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";

function TagInput({
  label,
  placeholder,
  tags,
  onAdd,
  onRemove,
  disabled,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
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
      <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <div
        className={`flex flex-wrap gap-2 rounded-lg border border-gray-700 bg-gray-800 p-2 focus-within:border-yellow-400 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded bg-gray-700 px-2 py-1 font-body text-xs text-white"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-1 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 bg-transparent font-body text-base text-white placeholder:text-gray-500 outline-none"
          />
        )}
      </div>
      <p className="mt-1 font-body text-[10px] text-gray-500">
        {disabled ? "Locked - see note above" : "Press Enter or comma to add"}
      </p>
    </div>
  );
}

export function FriendForm({
  initialData,
  friendId,
  hasPlayed = false,
}: {
  initialData?: {
    name: string;
    interests: string[];
    hobbies: string[];
    dislikes: string[];
    budgetMin: number | null;
    budgetMax: number | null;
    notes: string | null;
    theme: ThemeKey;
    currency?: string;
    validUntil?: string | Date | null;
  };
  friendId?: string;
  // True once the friend has played at least once - gift-relevant fields
  // get locked so B's in-progress prize pool doesn't change under them
  hasPlayed?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState<ThemeKey>(initialData?.theme ?? "bold");
  const [currency, setCurrency] = useState<CurrencyCode>(
    (initialData?.currency as CurrencyCode) ?? "IDR"
  );
  const [interests, setInterests] = useState<string[]>(
    initialData?.interests ?? []
  );
  const [hobbies, setHobbies] = useState<string[]>(initialData?.hobbies ?? []);
  const [dislikes, setDislikes] = useState<string[]>(
    initialData?.dislikes ?? []
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [validUntil, setValidUntil] = useState<string>(
    initialData?.validUntil
      ? new Date(initialData.validUntil).toISOString().split("T")[0]
      : ""
  );

  const isEditMode = !!friendId;
  const locked = isEditMode && hasPlayed;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
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
      currency,
      validUntil: validUntil || null,
      _honeypot: formData.get("_honeypot") as string,
    };

    startTransition(async () => {
      // Edit mode → updateFriend, Create mode → createFriend
      const result = isEditMode
        ? await updateFriend(friendId, data)
        : await createFriend(data);

      if ("error" in result) {
        if (typeof result.error === "string") {
          setFormError(result.error);
        } else {
          setErrors(result.error as Record<string, string[]>);
        }
        return;
      }

      if (!isEditMode) {
        saveProfileToLocalStorage({
          id: result.id,
          shareToken: result.shareToken,
          name: result.name,
          theme: result.theme,
          createdAt: new Date().toISOString(),
        });
      }

      router.push(`/friends/${result.id}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <input name="_honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {locked && (
        <div className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 font-body text-xs text-yellow-200">
          Your friend already started playing, so interests, hobbies, dislikes,
          budget, currency, and notes are locked to keep their remaining draws
          from a different prize pool. You can still update the name, theme, or
          deadline.
        </div>
      )}

      {formError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 font-body text-xs text-red-400">
          {formError}
        </div>
      )}

      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
          Friend&apos;s Name
        </label>
        <input
          name="name"
          type="text"
          placeholder="e.g. Sarah"
          defaultValue={initialData?.name ?? ""}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-body text-base text-white placeholder:text-gray-500 outline-none focus:border-yellow-400"
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
        disabled={locked}
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
        disabled={locked}
      />

      <TagInput
        label="Dislikes (helps AI avoid bad gifts)"
        placeholder="e.g. spicy food, loud music..."
        tags={dislikes}
        onAdd={(t) => setDislikes((prev) => [...prev, t])}
        onRemove={(i) =>
          setDislikes((prev) => prev.filter((_, idx) => idx !== i))
        }
        disabled={locked}
      />

      <div>
        <label className="mb-2 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
          Budget Currency
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
            <button
              key={code}
              type="button"
              disabled={locked}
              onClick={() => setCurrency(code)}
              className={`rounded px-3 py-1.5 font-pixel text-[8px] transition-all border disabled:cursor-not-allowed disabled:opacity-50 ${
                currency === code
                  ? "bg-yellow-400 border-yellow-400 text-gray-900"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {CURRENCIES[code].symbol} {code}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
          Budget ({currency})
        </label>
        <div className="flex items-center gap-3">
          <input
            name="budgetMin"
            type="number"
            placeholder="Min e.g. 100000"
            min={0}
            max={100000000}
            defaultValue={initialData?.budgetMin ?? ""}
            disabled={locked}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-body text-base text-white placeholder:text-gray-500 outline-none focus:border-yellow-400 disabled:opacity-50"
          />
          <span className="font-body text-gray-500">-</span>
          <input
            name="budgetMax"
            type="number"
            placeholder="Max e.g. 500000"
            min={0}
            max={100000000}
            defaultValue={initialData?.budgetMax ?? ""}
            disabled={locked}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-body text-base text-white placeholder:text-gray-500 outline-none focus:border-yellow-400 disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
          Extra Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="e.g. She just got promoted, loves vintage aesthetic..."
          defaultValue={initialData?.notes ?? ""}
          disabled={locked}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-body text-base text-white placeholder:text-gray-500 outline-none focus:border-yellow-400 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="mb-1 block font-pixel text-[9px] uppercase tracking-wider text-gray-400">
          Link Deadline{" "}
          <span className="normal-case font-body text-gray-500">
            (optional)
          </span>
        </label>
        <input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 font-body text-base text-white outline-none focus:border-yellow-400"
        />
        <p className="mt-1 font-body text-[10px] text-gray-500">
          After this date the link will be locked, set it for when you plan to
          buy the gift
        </p>
      </div>

      <ThemePicker value={theme} onChange={setTheme} />

      <PixelButton
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white hover:bg-gray-700"
      >
        {isPending
          ? "SAVING..."
          : isEditMode
            ? "✦ SAVE & REGENERATE GIFTS"
            : "FIND GIFTS ✦"}
      </PixelButton>

      {isEditMode && (
        <button
          type="button"
          onClick={() => router.push(`/friends/${friendId}`)}
          className="w-full cursor-pointer font-body text-sm text-gray-400 hover:text-gray-600"
        >
          ← Cancel
        </button>
      )}
    </form>
  );
}
