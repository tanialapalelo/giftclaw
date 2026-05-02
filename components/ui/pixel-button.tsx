export function PixelButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`
        font-pixel text-[10px] uppercase tracking-wider
        px-6 py-3
        border-b-4 border-r-4 border-t-2 border-l-2
        border-b-black/30 border-r-black/30
        border-t-white/30 border-l-white/30
        active:border-b-2 active:border-r-2
        active:border-t-4 active:border-l-4
        active:translate-y-[2px]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
