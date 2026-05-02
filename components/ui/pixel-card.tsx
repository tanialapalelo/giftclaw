export function PixelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        border-4 border-black
        shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]
        bg-white p-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}
