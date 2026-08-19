import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-runs the server components on the current route when the tab regains
// focus, so gift regeneration that happened while the tab was in the
// background (via lazy generation on another page load) shows up without a
// manual reload. No polling - only fires on focus-regain.
export function useRefreshOnFocus(enabled: boolean) {
  const router = useRouter();

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
}
