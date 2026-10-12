import { describe, it, expect } from "vitest";
import { isLinkExpired, linkClosesAt } from "@/lib/link-expiry";

// The friend form stores a date-only value, which parses as UTC midnight
const DEADLINE = new Date("2026-10-10");

describe("linkClosesAt", () => {
  it("is the last millisecond of the chosen day in UTC", () => {
    expect(linkClosesAt(DEADLINE).toISOString()).toBe(
      "2026-10-10T23:59:59.999Z"
    );
  });

  it("ignores any time-of-day stored with the deadline", () => {
    expect(linkClosesAt(new Date("2026-10-10T15:30:00Z")).toISOString()).toBe(
      "2026-10-10T23:59:59.999Z"
    );
  });
});

describe("isLinkExpired", () => {
  it("is never expired without a deadline", () => {
    expect(isLinkExpired(null)).toBe(false);
    expect(isLinkExpired(undefined)).toBe(false);
  });

  it("stays open for the whole chosen day", () => {
    expect(isLinkExpired(DEADLINE, new Date("2026-10-10T00:00:00Z"))).toBe(
      false
    );
    expect(isLinkExpired(DEADLINE, new Date("2026-10-10T23:59:59.999Z"))).toBe(
      false
    );
  });

  it("closes right after the chosen day ends in UTC", () => {
    expect(isLinkExpired(DEADLINE, new Date("2026-10-11T00:00:00Z"))).toBe(
      true
    );
  });

  it("accepts the ISO string form the client receives", () => {
    const now = new Date("2026-10-11T00:00:00Z");
    expect(isLinkExpired(DEADLINE.toISOString(), now)).toBe(true);
  });

  it("treats an unparseable deadline as no deadline", () => {
    expect(isLinkExpired("not-a-date")).toBe(false);
  });

  it("treats a long-past deadline as expired", () => {
    expect(isLinkExpired(new Date("2020-01-01"))).toBe(true);
  });
});
