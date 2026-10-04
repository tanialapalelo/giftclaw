// Regression test for the play page leaking the giver's private friend id
// into the receiver's RSC payload. Everything the page passes to PlayClient
// is serialized to the browser, so its props must never contain the id.
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";

const FRIEND_ID = "a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d";
const SHARE_TOKEN = "b4e3d2c1-5f6a-4b7c-9d0e-1f2a3b4c5d6e";

vi.mock("@/lib/actions/friend", () => ({
  getFriendByShareToken: vi.fn(),
}));
vi.mock("@/lib/actions/gift", () => ({
  getGiftSuggestionsByShareToken: vi.fn(),
}));
vi.mock("@/lib/actions/game", () => ({
  getGameResultsForFriend: vi.fn(),
}));
vi.mock("@/components/play-client", () => ({
  PlayClient: () => null,
}));

import PlayPage from "@/app/play/[shareToken]/page";
import { PlayClient } from "@/components/play-client";
import { getFriendByShareToken } from "@/lib/actions/friend";
import { getGiftSuggestionsByShareToken } from "@/lib/actions/gift";
import { getGameResultsForFriend } from "@/lib/actions/game";

type FriendRow = Awaited<ReturnType<typeof getFriendByShareToken>>;

describe("PlayPage client props", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate a row that still carries the private id (as it did before the
    // fix), so the test proves the page itself strips it, not just the query
    vi.mocked(getFriendByShareToken).mockResolvedValue({
      id: FRIEND_ID,
      name: "Audit Friend",
      theme: "bold",
      shareToken: SHARE_TOKEN,
      interests: ["music"],
      hobbies: ["hiking"],
      validUntil: null,
    } as unknown as FriendRow);
    vi.mocked(getGiftSuggestionsByShareToken).mockResolvedValue({
      suggestions: [
        { name: "Mug", reason: "r", priceRange: "p", category: "c" },
      ],
      modelVersion: "test",
      cached: true,
    });
    vi.mocked(getGameResultsForFriend).mockResolvedValue(null);
  });

  async function renderPlayClientProps() {
    const tree = (await PlayPage({
      params: Promise.resolve({ shareToken: SHARE_TOKEN }),
    })) as ReactElement<{ children: ReactElement<Record<string, unknown>> }>;
    const client = tree.props.children;
    expect(client.type).toBe(PlayClient);
    return client.props;
  }

  it("passes an explicit {name, interests, hobbies} friend DTO", async () => {
    const props = await renderPlayClientProps();
    expect(props.friend).toEqual({
      name: "Audit Friend",
      interests: ["music"],
      hobbies: ["hiking"],
    });
  });

  it("never includes the private friend id anywhere in the props", async () => {
    const props = await renderPlayClientProps();
    expect(JSON.stringify(props)).not.toContain(FRIEND_ID);
  });

  it("resolves gift suggestions by shareToken, not by friend id", async () => {
    await renderPlayClientProps();
    expect(getGiftSuggestionsByShareToken).toHaveBeenCalledWith(SHARE_TOKEN);
  });
});
