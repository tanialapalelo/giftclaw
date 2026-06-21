# Reveal Panel Popup — Design

## Problem

`RevealPanel` (shown when a claw grab completes) currently renders inline below the claw machine as a static card with one slide-in animation. It reads as flat/stiff for what should be the game's payoff moment, and the back-button gap on `friends/new` (a separate, smaller fix bundled into the same pass) means there's no way back to home from the friend-creation form except the browser back button.

## Scope

1. `app/friends/new/page.tsx` — add a `← HOME` link, reusing the existing pattern from `app/friends/[id]/page.tsx`.
2. `RevealPanel` — convert from an inline card to a true modal popup with a staggered entrance animation and a synthesized sound stinger.

## Part 1: Back button on `friends/new`

Add the same `← HOME` link (`Link href="/"`, pixel-styled pill button) already used in `app/friends/[id]/page.tsx:321-329`, placed near the page header above the form. No new component needed — copy the existing markup pattern.

## Part 2: Reveal panel popup

### Rendering approach

Render via `createPortal(..., document.body)` instead of inline/`position: fixed` in place. Reason: `ClawGame`'s root wrapper conditionally applies `animate-screenshake` (a CSS `transform`) during the grab phase; any ancestor with an active `transform` changes `position: fixed`'s containing block away from the viewport. A portal to `document.body` avoids depending on "no transform is active right now" being true.

### Component/data flow

```
PlayClient (owns useThemeMusic(themeKey) → { start, toggle, isMuted, playStinger })
  → ClawGame (new prop: playStinger, threaded the same way themeKey-driven music already is)
    → RevealPanel (calls playStinger() once on mount, alongside the existing confetti effect)
```

`playStinger` is added to `useThemeMusic` (`hooks/use-theme-music.ts`) rather than built as a second, independent audio system — it reuses the hook's existing `AudioContext`/`masterGain`, so it automatically respects the mute toggle. If the audio context hasn't been started (`!ctx || !master`), `playStinger` no-ops safely, matching the existing guard pattern in `scheduleLoop`.

### Backdrop & dismiss

`fixed inset-0` backdrop, `bg-black/60 backdrop-blur-sm`, **no `onClick` handler** — clicking it does nothing. Only the panel's own two buttons (`TRY AGAIN` / `SEE MY VIBES`) advance the game state; there is no third "dismissed but undecided" state in `ClawGame`'s phase machine, so an outside-click dismiss has nowhere meaningful to go.

Minimal accessibility: `role="dialog"`, `aria-modal="true"` on the panel container.

### Animation sequence

CSS keyframes + `animationDelay` per element — no JS timers. Replaces the single `animate-slot-reveal` slide-in:

| Step | Delay | Effect |
|---|---|---|
| Backdrop | 0ms | Fade in, opacity 0→1, ~150ms |
| Panel shell | 0ms | Scale-pop with overshoot: `scale(0.85) → scale(1.03) → scale(1)`, ~300ms |
| Lucky banner (if `isLucky`) | 150ms | Existing `animate-bounce-in`, delayed |
| Gift emoji + sparkles | 200ms | Existing `animate-bounce-in` / `animate-blink`, delayed |
| Clue text | 350ms | New fade-up: opacity 0→1, translateY 8px→0 |
| Mood tags | 450ms | Same fade-up, later |
| Buttons | 550ms | Same fade-up, last |

Confetti fires immediately on mount, unchanged. Total sequence ≈ 650ms, comparable to the current animation's duration.

### Sound stinger

`playStinger()` schedules 3 quick ascending notes (a major triad relative to the active theme's root note, for harmonic consistency with whatever ambient melody is playing) through the existing `masterGain`. No new `AudioContext`.

## New CSS (globals.css)

- `.animate-modal-backdrop-fade` — opacity fade-in.
- `.animate-modal-pop` — scale overshoot entrance.
- `.animate-fade-up` (parameterized via inline `animationDelay`) — used for clue text, mood tags, buttons.

## Out of scope

- No changes to `ClawGame`'s phase state machine itself.
- No focus trap / focus return beyond the `role="dialog"` attribute (acceptable for this app's scope — no other modals exist yet to establish a shared pattern for).
- No changes to confetti behavior.

## Testing

Manual verification via dev server (`/run` or equivalent) — this is a presentational/animation change; no automated test meaningfully covers "does this look more interesting." Confirm:
- Popup renders centered over a dimmed/blurred backdrop, machine behind it not interactable.
- Backdrop click does nothing.
- Stinger plays in sync with the music mute toggle (muted when music is muted).
- Sequence works for both lucky and non-lucky reveals, and when `canTryAgain` is false (no `TRY AGAIN` button).
