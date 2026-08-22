"use client";

import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { RefreshBanner } from "@/components/refresh-banner";

// Mount inside a server component page to revalidate it when the tab
// regains focus, with a brief "Updated" banner confirming it happened.
export function RefreshOnFocus() {
  const justRefreshed = useRefreshOnFocus(true);
  return <RefreshBanner show={justRefreshed} />;
}
