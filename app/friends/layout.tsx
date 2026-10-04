import type { Metadata } from "next";

// Giver dashboards, gift lists, and edit forms are private to whoever holds
// the link. Override the root layout's index/follow so search engines skip
// every /friends/* page.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
