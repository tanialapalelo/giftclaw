import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FriendForm } from "@/components/friend-form";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/actions/friend", () => ({
  updateFriend: vi.fn(),
  createFriend: vi.fn(),
}));

import { updateFriend } from "@/lib/actions/friend";

const INITIAL_DATA = {
  name: "Sarah",
  interests: ["gaming"],
  hobbies: [],
  dislikes: [],
  budgetMin: null,
  budgetMax: null,
  notes: null,
  theme: "bold" as const,
  currency: "IDR",
  validUntil: null,
};

describe("FriendForm edit-mode redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to the gifts page when the save regenerated suggestions", async () => {
    vi.mocked(updateFriend).mockResolvedValue({
      id: "friend-1",
      name: "Sarah",
      theme: "bold",
      shareToken: "token-1",
      regenerated: true,
    });

    render(<FriendForm initialData={INITIAL_DATA} friendId="friend-1" />);

    await userEvent.click(
      screen.getByRole("button", { name: /save & regenerate gifts/i })
    );

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/friends/friend-1/gifts")
    );
  });

  it("redirects to the profile page when nothing gift-relevant changed", async () => {
    vi.mocked(updateFriend).mockResolvedValue({
      id: "friend-1",
      name: "Sarah",
      theme: "bold",
      shareToken: "token-1",
      regenerated: false,
    });

    render(<FriendForm initialData={INITIAL_DATA} friendId="friend-1" />);

    await userEvent.click(
      screen.getByRole("button", { name: /save & regenerate gifts/i })
    );

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/friends/friend-1")
    );
  });
});
