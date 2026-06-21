# Reveal Panel Popup & Back Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `← HOME` link to `friends/new`, and convert the claw machine's `RevealPanel` from a static inline card into a portal-rendered modal popup with a staggered entrance animation and a synthesized sound stinger.

**Architecture:** `RevealPanel` moves from inline rendering to `createPortal(..., document.body)` so it escapes any transform-context issues from `ClawGame`'s screenshake. A new `playStinger()` function is added to the existing `useThemeMusic` hook (reusing its `AudioContext`/`masterGain`, so mute state is respected automatically) and threaded down through `PlayClient → ClawGame → RevealPanel`. New CSS keyframes drive the staggered entrance; no JS timers are needed for sequencing.

**Tech Stack:** React 19 (`createPortal`), Tailwind CSS v4 + raw CSS keyframes (`app/globals.css`), Web Audio API (existing `useThemeMusic` hook).

## Global Constraints

- No changes to `ClawGame`'s `GamePhase` state machine.
- Backdrop click does nothing — no dismiss handler, per the approved spec.
- No focus trap beyond `role="dialog"` / `aria-modal="true"` — out of scope per spec.
- `playStinger` must no-op safely if the audio context hasn't started (`!ctx || !master`), matching the existing guard pattern in `scheduleLoop`.
- This is presentational/animation work — verification is manual via the dev server (`pnpm dev`), plus `npx tsc --noEmit` and `npx eslint .` as the automated checks available, per the approved spec's own Testing section.

---

### Task 1: Add `← HOME` link to `friends/new`

**Files:**
- Modify: `app/friends/new/page.tsx`

**Interfaces:** None — this task is self-contained, no shared types/functions with other tasks.

- [ ] **Step 1: Add the back link**

Current file (`app/friends/new/page.tsx`):
```tsx
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
```

Replace it with:
```tsx
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
```

This reuses the exact pill-button shape/copy already established in `app/friends/[id]/page.tsx:321-329` (`← HOME`, rounded-full border pill, `font-pixel text-[9px] uppercase tracking-wider`), substituting the dark-page gray palette (`border-gray-700 text-gray-400`) since this page isn't theme-aware (`friends/new` has no `Friend` record yet, so no `theme` object exists to read from).

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint app/friends/new/page.tsx`
Expected: no errors.

- [ ] **Step 3: Manually verify**

Run: `pnpm dev`, open `http://localhost:3000/friends/new`.
Expected: a `← HOME` pill link appears above the "WHO'S THE LUCKY FRIEND?" header; clicking it navigates to `/`.

- [ ] **Step 4: Commit**

```bash
git add app/friends/new/page.tsx
git commit -m "feat: add back-to-home link on friends/new page"
```

---

### Task 2: Add `playStinger` to `useThemeMusic`

**Files:**
- Modify: `hooks/use-theme-music.ts`

**Interfaces:**
- Consumes: existing hook internals — `ctxRef: React.RefObject<AudioContext | null>`, `masterGainRef: React.RefObject<GainNode | null>`, `themeKeyRef: React.RefObject<ThemeKey>`, `THEME_MELODIES: Record<ThemeKey, MelodyConfig>` (from `@/lib/theme-melodies`, where `MelodyConfig = { notes: number[]; bpm: number; waveform: OscillatorType; gain: number }`).
- Produces: `playStinger: () => void`, added to the hook's return object. Task 3 consumes this exact name and signature.

- [ ] **Step 1: Add the `playStinger` function**

In `hooks/use-theme-music.ts`, after the `toggle` function (currently ending at line 80, just before the cleanup `useEffect` at line 82), add:

```ts
  const playStinger = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const mel = THEME_MELODIES[themeKeyRef.current];
    const root = mel.notes.find((f) => f > 0) ?? 440;
    // Major triad (root, major third, perfect fifth), one octave up so it
    // cuts through whatever ambient melody is already playing.
    const intervals = [1, 5 / 4, 3 / 2];
    const startTime = ctx.currentTime + 0.02;
    const noteDur = 0.12;

    intervals.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(master);
      osc.type = mel.waveform;
      osc.frequency.value = root * ratio * 2;
      const t = startTime + i * noteDur * 0.85;
      const end = t + noteDur;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.linearRampToValueAtTime(0, end);
      osc.start(t);
      osc.stop(end + 0.01);
    });
  }, []);
```

Then update the return statement at the bottom of the file from:
```ts
  return { start, toggle, isMuted };
```
to:
```ts
  return { start, toggle, isMuted, playStinger };
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint hooks/use-theme-music.ts`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-theme-music.ts
git commit -m "feat: add playStinger to useThemeMusic for reveal sound effect"
```

(Full behavioral verification — confirming the stinger actually plays and respects mute — happens in Task 5, once `RevealPanel` calls it.)

---

### Task 3: Thread `playStinger` through `PlayClient` → `ClawGame`

**Files:**
- Modify: `components/play-client.tsx`
- Modify: `components/claw-machine/claw-game.tsx`

**Interfaces:**
- Consumes: `playStinger: () => void` from `useThemeMusic` (Task 2).
- Produces: `ClawGame` accepts a new `playStinger?: () => void` prop, passed through to `RevealPanel` (Task 5 consumes this exact prop name).

- [ ] **Step 1: Destructure `playStinger` in `PlayClient` and pass it to `ClawGame`**

In `components/play-client.tsx`, change line 208 from:
```tsx
  const { start, toggle, isMuted } = useThemeMusic(themeKey);
```
to:
```tsx
  const { start, toggle, isMuted, playStinger } = useThemeMusic(themeKey);
```

Then update the `<ClawGame ... />` call (lines 252-258) from:
```tsx
          <ClawGame
            gifts={gifts}
            theme={theme}
            shareToken={shareToken}
            previousGrabCount={alreadyPlayedCount}
            previousResults={previousResults ?? undefined}
          />
```
to:
```tsx
          <ClawGame
            gifts={gifts}
            theme={theme}
            shareToken={shareToken}
            previousGrabCount={alreadyPlayedCount}
            previousResults={previousResults ?? undefined}
            playStinger={playStinger}
          />
```

- [ ] **Step 2: Accept and forward `playStinger` in `ClawGame`**

In `components/claw-machine/claw-game.tsx`, update the function signature (lines 35-46) from:
```tsx
export function ClawGame({
  gifts,
  theme,
  shareToken,
  previousGrabCount = 0,
  previousResults,
}: {
  gifts: GiftSuggestion[];
  theme: Theme;
  shareToken: string;
  previousGrabCount?: number;
  previousResults?: GameResultWithGift[];
```
to:
```tsx
export function ClawGame({
  gifts,
  theme,
  shareToken,
  previousGrabCount = 0,
  previousResults,
  playStinger,
}: {
  gifts: GiftSuggestion[];
  theme: Theme;
  shareToken: string;
  previousGrabCount?: number;
  previousResults?: GameResultWithGift[];
  playStinger?: () => void;
```

(Leave the rest of the destructured type object — the closing `}` and remaining lines — unchanged.)

Then update the `<RevealPanel ... />` call (lines 422-430) from:
```tsx
        <RevealPanel
          gift={currentGift}
          onResetAction={handleReset}
          onViewPicksAction={handleViewPicks}
          canTryAgain={canTryAgain && remainingAttempts > 0}
          attemptNumber={revealAttempt}
          maxAttempts={MAX_ATTEMPTS}
          theme={theme}
        />
```
to:
```tsx
        <RevealPanel
          gift={currentGift}
          onResetAction={handleReset}
          onViewPicksAction={handleViewPicks}
          canTryAgain={canTryAgain && remainingAttempts > 0}
          attemptNumber={revealAttempt}
          maxAttempts={MAX_ATTEMPTS}
          theme={theme}
          playStinger={playStinger}
        />
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint components/play-client.tsx components/claw-machine/claw-game.tsx`
Expected: errors about `RevealPanel` not accepting a `playStinger` prop yet — this is expected until Task 5. Confirm there are no *other* errors (e.g. typos in the prop threading itself) by reading the error output carefully.

- [ ] **Step 4: Commit**

```bash
git add components/play-client.tsx components/claw-machine/claw-game.tsx
git commit -m "feat: thread playStinger prop from PlayClient through ClawGame"
```

---

### Task 4: Add modal & stagger CSS to `globals.css`

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS classes `.animate-modal-backdrop-fade`, `.animate-modal-pop`, `.animate-fade-up` — Task 5 applies these exact class names.

- [ ] **Step 1: Add the new keyframes and utility classes**

In `app/globals.css`, immediately after the existing `.animate-slot-reveal` block (ends at line 395, right before the `@keyframes chute-drop` block at line 397), insert:

```css
@keyframes modal-backdrop-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-modal-backdrop-fade {
  animation: modal-backdrop-fade 0.15s ease-out forwards;
}

@keyframes modal-pop {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  60% {
    transform: scale(1.03);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-modal-pop {
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fade-up 0.3s ease-out both;
}
```

Note `.animate-fade-up` uses the `both` fill-mode (in the animation shorthand) deliberately — elements using this class will be given an `animationDelay` via inline `style` in Task 5, and `both` makes the element hold its `from` state (`opacity: 0`) for the entire delay period instead of flashing visible before the delay elapses, then holds the `to` state after finishing.

- [ ] **Step 2: Lint the CSS file (no dedicated CSS linter configured — verify by running the app)**

Run: `pnpm dev`
Expected: dev server starts with no Tailwind/PostCSS build errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add modal popup and fade-up entrance keyframes"
```

---

### Task 5: Rewrite `RevealPanel` as a portal-based modal

**Files:**
- Modify: `components/claw-machine/reveal-panel.tsx`

**Interfaces:**
- Consumes: `playStinger?: () => void` (Task 2/3), `.animate-modal-backdrop-fade` / `.animate-modal-pop` / `.animate-fade-up` (Task 4), `createPortal` from `react-dom`.
- Produces: `RevealPanel` now renders via `createPortal(..., document.body)` instead of inline. No other component reads from `RevealPanel`'s internals, so this is the final integration point.

- [ ] **Step 1: Replace the full file contents**

Replace all of `components/claw-machine/reveal-panel.tsx` with:

```tsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import type { GiftSuggestion } from "@/types";
import type { Theme } from "@/lib/themes";
import { getVibeFromGift } from "@/lib/vibe";

export function RevealPanel({
  gift,
  onResetAction,
  onViewPicksAction,
  canTryAgain,
  attemptNumber,
  maxAttempts,
  theme,
  isLucky = false,
  playStinger,
}: {
  gift: GiftSuggestion;
  onResetAction: () => void;
  onViewPicksAction: () => void;
  canTryAgain: boolean;
  attemptNumber: number;
  maxAttempts: number;
  theme: Theme;
  isLucky?: boolean;
  playStinger?: () => void;
}) {
  const vibe = getVibeFromGift(gift);

  // Fire the reveal stinger + confetti once, on mount
  useEffect(() => {
    playStinger?.();

    if (isLucky) {
      // Golden burst for lucky grab
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#facc15", "#fbbf24", "#f59e0b", "#fcd34d", "#ffffff"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.4 },
          angle: 60,
          colors: ["#facc15", "#fbbf24", "#ff6b6b"],
        });
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.4 },
          angle: 120,
          colors: ["#facc15", "#fbbf24", "#60a5fa"],
        });
      }, 300);
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#facc15", "#f472b6", "#34d399", "#60a5fa", "#c084fc"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLucky]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-modal-backdrop-fade">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm animate-modal-pop"
      >
        {/* Zigzag top edge — ticket/receipt feel (uses same bg as reveal panel) */}
        <div
          className={`h-3 w-full -mb-px ${theme.reveal.bg}`}
          style={{
            clipPath:
              "polygon(0 0, 4% 100%, 8% 0, 12% 100%, 16% 0, 20% 100%, 24% 0, 28% 100%, 32% 0, 36% 100%, 40% 0, 44% 100%, 48% 0, 52% 100%, 56% 0, 60% 100%, 64% 0, 68% 100%, 72% 0, 76% 100%, 80% 0, 84% 100%, 88% 0, 92% 100%, 96% 0, 100% 100%, 100% 0)",
          }}
        />
        <div
          className={`p-6 text-center space-y-4 rounded-lg ${theme.reveal.bg}`}
        >
          {/* Lucky grab banner */}
          {isLucky && (
            <div
              className="animate-bounce-in flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-1.5 mx-auto w-fit"
              style={{ animationDelay: "150ms", animationFillMode: "both" }}
            >
              <span className="text-base">⭐</span>
              <span className="font-pixel text-[8px] text-yellow-900 tracking-widest">
                LUCKY GRAB!
              </span>
              <span className="text-base">⭐</span>
            </div>
          )}

          {/* Attempt counter */}
          <p
            className={`font-pixel text-[7px] tracking-widest ${theme.reveal.subtitle}`}
          >
            ATTEMPT {attemptNumber} / {maxAttempts}
          </p>

          {/* Gift emoji with sparkle burst — same emoji as in the machine */}
          <div className="relative inline-block w-24 h-24">
            <div className="absolute inset-0 flex items-center justify-center">
              {["★", "✦", "◆", "✦", "★"].map((s, i) => (
                <span
                  key={i}
                  className={`absolute font-pixel text-[10px] animate-blink opacity-70 ${theme.reveal.subtitle}`}
                  style={{
                    transform: `rotate(${i * 72}deg) translateY(-40px)`,
                    animationDelay: `${200 + i * 150}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce-in"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}
            >
              {gift.emoji ?? vibe.emoji}
            </div>
          </div>

          <div
            className="space-y-2 animate-fade-up"
            style={{ animationDelay: "350ms" }}
          >
            <p
              className={`font-pixel text-[8px] uppercase tracking-widest ${theme.reveal.subtitle}`}
            >
              🔍 YOUR CLUE
            </p>
            <p
              className={`font-body text-sm leading-relaxed max-w-xs mx-auto ${theme.reveal.title}`}
            >
              &ldquo;{vibe.tagline}&rdquo;
            </p>
            <p
              className={`font-pixel text-[7px] ${theme.reveal.subtitle} opacity-60`}
            >
              see all your gifts after final grab
            </p>
          </div>

          {/* Mood tags */}
          <div
            className="flex items-center justify-center gap-2 animate-fade-up"
            style={{ animationDelay: "450ms" }}
          >
            {vibe.moodTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 font-body text-xs bg-black/10 ${theme.reveal.badge}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div
            className="flex items-center justify-center gap-3 pt-2 animate-fade-up"
            style={{ animationDelay: "550ms" }}
          >
            {canTryAgain && (
              <button
                onClick={onResetAction}
                className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform bg-black/20 ${theme.reveal.title}`}
              >
                ↻ TRY AGAIN
              </button>
            )}
            <button
              onClick={onViewPicksAction}
              className={`rounded-full px-6 py-3 font-pixel text-[10px] active:scale-95 transition-transform ${theme.reveal.button}`}
            >
              {canTryAgain ? "★ SEE MY VIBES" : "★ SEE ALL VIBES"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint components/claw-machine/reveal-panel.tsx components/claw-machine/claw-game.tsx components/play-client.tsx`
Expected: no errors (this resolves the expected Task 3 error about the missing `playStinger` prop on `RevealPanel`).

- [ ] **Step 3: Manually verify the full flow**

Run: `pnpm dev`, open a `/play/[shareToken]` link for an existing friend (or create one via `/friends/new`), start the game, and grab a prize.

Expected:
- The background (claw machine) dims and blurs behind a centered popup.
- The popup pops in with a slight overshoot, not a flat slide.
- Inside the popup: emoji/sparkles appear shortly after the panel, then the clue text, then mood tags, then buttons — visibly staggered, not all at once.
- A short ascending 3-note chime plays right as the popup appears.
- Clicking the dimmed backdrop does nothing — the popup stays open.
- Toggling the music mute button (top-right during gameplay) and then grabbing again — confirm the stinger is silent while muted.
- Click "TRY AGAIN" (if attempts remain) — confirm it still correctly resets the claw game state as before.
- Click "SEE MY VIBES" / "SEE ALL VIBES" — confirm it still correctly opens `GrabHistory` as before.

- [ ] **Step 4: Commit**

```bash
git add components/claw-machine/reveal-panel.tsx
git commit -m "feat: convert reveal panel to a portal-based popup with staggered entrance and stinger"
```

---

## Self-Review Notes

- **Spec coverage:** Part 1 (back button) → Task 1. Part 2's rendering approach (portal) → Task 5. Backdrop/dismiss → Task 5 (no onClick handler at all, confirmed in the JSX). Animation sequence table → Task 5's per-element `animationDelay` values match the spec's table exactly (0/0/150/200/350/450/550ms). Sound stinger → Tasks 2, 3, 5. New CSS → Task 4. Accessibility (`role="dialog"`, `aria-modal`) → Task 5.
- **Type consistency:** `playStinger?: () => void` is the exact signature used consistently across `hooks/use-theme-music.ts` (Task 2's return value), `components/play-client.tsx` (Task 3's destructure/pass-through), `components/claw-machine/claw-game.tsx` (Task 3's prop type), and `components/claw-machine/reveal-panel.tsx` (Task 5's prop type) — all optional, all `() => void`, no mismatches.
- **No placeholders:** every step has complete, copy-pasteable code; no "TBD"/"similar to Task N" shortcuts.
