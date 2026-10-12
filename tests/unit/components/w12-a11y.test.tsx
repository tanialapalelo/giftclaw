import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefreshBanner } from "@/components/refresh-banner";
import { FriendForm } from "@/components/friend-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/actions/friend", () => ({ createFriend: vi.fn(), updateFriend: vi.fn() }));

describe("W12", () => {
  it("hides idle banner from a11y tree, exposes when shown", () => {
    const { rerender } = render(<RefreshBanner show={false} />);
    expect(screen.queryByRole("status")).toBeNull();
    rerender(<RefreshBanner show />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("associates labels with controls", () => {
    render(<FriendForm />);
    expect(screen.getByLabelText("Friend's Name")).toBeTruthy();
    expect(screen.getByLabelText(/Extra Notes/)).toBeTruthy();
    expect(screen.getByLabelText(/Link Deadline/)).toBeTruthy();
    expect(screen.getByLabelText(/^Budget \(/)).toBeTruthy();
  });

  it("ignores duplicate tags", async () => {
    render(<FriendForm />);
    const inputs = screen.getAllByRole("textbox");
    const tagInput = inputs.find((i) => i.getAttribute("name") === null && i.id && !["friend-name","friend-notes"].includes(i.id))!;
    await userEvent.type(tagInput, "books{enter}books{enter}");
    expect(screen.getAllByText("books").length).toBe(1);
  });
});
