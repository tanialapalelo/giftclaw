import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// document.visibilityState is normally read-only; stub it per test so we can
// simulate the tab-hidden -> tab-visible transition a same-window tab switch
// produces (window focus/blur is unreliable for that case - only
// visibilitychange fires reliably, which is what this hook relies on).
function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

describe("useRefreshOnFocus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setVisibility("visible");
  });

  it("refreshes when the tab becomes visible again (same-window tab-switch case)", () => {
    renderHook(() => useRefreshOnFocus(true));

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(mockRefresh).not.toHaveBeenCalled();

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("does not refresh on visibilitychange when disabled", () => {
    renderHook(() => useRefreshOnFocus(false));

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("also refreshes on window focus (separate-window/app-switch case)", () => {
    renderHook(() => useRefreshOnFocus(true));

    window.dispatchEvent(new Event("focus"));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("stops listening after the enabled flag flips to false", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useRefreshOnFocus(enabled),
      { initialProps: { enabled: true } }
    );

    rerender({ enabled: false });

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
