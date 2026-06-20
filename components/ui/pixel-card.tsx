export function PixelCard({
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`
        rounded-lg border p-4
        ${
          dark
            ? "border-white/10 bg-white/[0.06] shadow-[2px_2px_0_0_rgba(255,255,255,0.04)]"
            : "border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]"
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}
