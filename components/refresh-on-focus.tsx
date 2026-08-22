"use client";

import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { RefreshBanner } from "@/components/refresh-banner";

// Mount inside a server component page to revalidate it when the tab
// regains focus, with a brief "Updated" banner that only shows when the
// refresh actually pulled in different data. `signal` should be a value
// derived from the same server-rendered data the page displays (e.g.
// `${friend.updatedAt}:${totalPlays}`) so a changed signal after refresh
// means the page's props genuinely changed.
export function RefreshOnFocus({ signal }: { signal: string | number }) {
  const justRefreshed = useRefreshOnFocus(true, signal);
  return <RefreshBanner show={justRefreshed} />;
}
