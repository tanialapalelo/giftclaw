"use client";

import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";

// Mount inside a server component page to revalidate it when the tab
// regains focus. Renders nothing.
export function RefreshOnFocus() {
  useRefreshOnFocus(true);
  return null;
}
