import type { Theme } from "@/lib/themes";

export function PixelLayout({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen overflow-hidden ${theme.page.bg} ${theme.page.pattern}`}>
      <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>
    </div>
  );
}
