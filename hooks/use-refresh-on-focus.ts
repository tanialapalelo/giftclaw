import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BANNER_DURATION_MS = 2000;

// Re-runs the server components on the current route when the tab regains
// focus, so gift regeneration that happened while the tab was in the
// background (via lazy generation on another page load) shows up without a
// manual reload. No polling - only fires on focus-regain.
//
// Returns `justRefreshed`, which flips true for BANNER_DURATION_MS after
// each refresh - callers use it to show a brief visible confirmation, since
// a router.refresh() with no on-screen change is otherwise indistinguishable
// from nothing having happened.
export function useRefreshOnFocus(enabled: boolean) {
  const router = useRouter();
  const [justRefreshed, setJustRefreshed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let hideTimer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      router.refresh();
      setJustRefreshed(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setJustRefreshed(false), BANNER_DURATION_MS);
    };

    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(hideTimer);
    };
  }, [enabled, router]);

  return justRefreshed;
}
