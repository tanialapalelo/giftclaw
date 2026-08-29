import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BANNER_DURATION_MS = 2000;

// Re-runs the server components on the current route when the tab regains
// focus, so data that changed elsewhere (another tab, another device) shows
// up without a manual reload. No polling - only fires on focus-regain.
//
// `signal` is a value the caller derives from the server-rendered data it
// wants to watch (e.g. a friend's updatedAt timestamp, a play count, a
// serialized suggestion list). router.refresh() itself resolves with no
// before/after diff of its own - the only reliable way to tell whether a
// refresh actually changed anything is to compare the props a caller gets
// re-rendered with against what it had before, which is exactly what a
// changed `signal` value means once the refreshed server payload flows back
// down. Returns `justRefreshed`, true for BANNER_DURATION_MS after the
// signal is observed to actually change, so callers can show a brief visible
// confirmation instead of a silent, unverifiable background action.
export function useRefreshOnFocus(enabled: boolean, signal: string | number) {
  const router = useRouter();
  const [justRefreshed, setJustRefreshed] = useState(false);
  const prevSignalRef = useRef(signal);
  const hasSeenSignalRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onFocus = () => router.refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, router]);

  useEffect(() => {
    if (!enabled) {
      // Don't flag a change that happened while we weren't watching.
      prevSignalRef.current = signal;
      return;
    }

    if (!hasSeenSignalRef.current) {
      hasSeenSignalRef.current = true;
      prevSignalRef.current = signal;
      return;
    }

    if (signal === prevSignalRef.current) return;
    prevSignalRef.current = signal;

    setJustRefreshed(true);
    const hideTimer = setTimeout(
      () => setJustRefreshed(false),
      BANNER_DURATION_MS
    );
    return () => clearTimeout(hideTimer);
  }, [signal, enabled]);

  return justRefreshed;
}
