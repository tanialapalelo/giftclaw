import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrabHistory } from "@/components/grab-history";
import { THEMES } from "@/lib/themes";

vi.mock("@/lib/actions/game", () => ({
  getGameResultsForFriend: vi.fn().mockResolvedValue(null),
}));

const GIFT = {
  name: "Vintage Camera",
  reason: "matches their retro aesthetic",
  priceRange: "$50-100",
  category: "hobby",
};

describe("GrabHistory - stop-early flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not show a stop-early option when there's nothing to keep playing for", () => {
    render(
      <GrabHistory
        shareToken="token-1"
        localHistory={[GIFT]}
        theme={THEMES.bold}
        canPlayAgain={false}
      />
    );

    expect(
      screen.queryByText(/i'm happy with this, stop here/i)
    ).not.toBeInTheDocument();
  });

  it("does not end the turn on a single click - it asks for confirmation first", async () => {
    const onPlayAgain = vi.fn();
    render(
      <GrabHistory
        shareToken="token-1"
        localHistory={[GIFT]}
        theme={THEMES.bold}
        canPlayAgain={true}
        onPlayAgain={onPlayAgain}
      />
    );

    await userEvent.click(screen.getByText(/i'm happy with this, stop here/i));

    expect(screen.getByText(/end your turn now/i)).toBeInTheDocument();
    // Not ended yet - just asking
    expect(screen.queryByText(/you're all done/i)).not.toBeInTheDocument();
    expect(onPlayAgain).not.toHaveBeenCalled();
  });

  it("canceling the confirmation returns to the normal keep-playing view", async () => {
    render(
      <GrabHistory
        shareToken="token-1"
        localHistory={[GIFT]}
        theme={THEMES.bold}
        canPlayAgain={true}
        onPlayAgain={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText(/i'm happy with this, stop here/i));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.getByRole("button", { name: /keep playing/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/end your turn now/i)).not.toBeInTheDocument();
  });

  it("confirming ends the turn and removes the keep-playing option", async () => {
    const onPlayAgain = vi.fn();
    render(
      <GrabHistory
        shareToken="token-1"
        localHistory={[GIFT]}
        theme={THEMES.bold}
        canPlayAgain={true}
        onPlayAgain={onPlayAgain}
      />
    );

    await userEvent.click(screen.getByText(/i'm happy with this, stop here/i));
    await userEvent.click(
      screen.getByRole("button", { name: /yes, i'm done/i })
    );

    expect(screen.getByText(/you're all done/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /keep playing/i })
    ).not.toBeInTheDocument();
    // Ending early is purely local UI state - never calls the "keep playing" callback
    expect(onPlayAgain).not.toHaveBeenCalled();
  });
});
