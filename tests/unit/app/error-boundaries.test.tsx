// Verifies client error boundaries report to Sentry and never leak raw
// error.message to end users, while still surfacing error.digest for support.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as Sentry from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import FriendError from "@/app/friends/[id]/error";
import FriendGiftsError from "@/app/friends/[id]/gifts/error";
import PlayError from "@/app/play/[shareToken]/error";
import GlobalError from "@/app/global-error";

const boundaries = [
  ["app/friends/[id]/error.tsx", FriendError],
  ["app/friends/[id]/gifts/error.tsx", FriendGiftsError],
  ["app/play/[shareToken]/error.tsx", PlayError],
  ["app/global-error.tsx (global-error)", GlobalError],
] as const;

describe.each(boundaries)("%s", (_name, Boundary) => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("reports the crash to Sentry with the original error", () => {
    const error = Object.assign(new Error("db password rejected: hunter2"), {
      digest: "digest-123",
    });

    render(<Boundary error={error} reset={vi.fn()} />);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("never shows the raw error message to the end user, and shows the digest", () => {
    const error = Object.assign(new Error("db password rejected: hunter2"), {
      digest: "digest-456",
    });

    render(<Boundary error={error} reset={vi.fn()} />);

    expect(screen.queryByText(/hunter2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/digest-456/)).toBeInTheDocument();
  });

  it("omits the digest line when none is provided", () => {
    const error = new Error("db password rejected: hunter2");

    render(<Boundary error={error} reset={vi.fn()} />);

    expect(screen.queryByText(/hunter2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^ID:/)).not.toBeInTheDocument();
  });
});
