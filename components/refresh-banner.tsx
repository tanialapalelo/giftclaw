// Brief visible confirmation that a focus-triggered refresh just happened.
// Always mounted so opacity can transition smoothly in both directions
// instead of popping in/out.
export function RefreshBanner({ show }: { show: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-yellow-400/40 bg-gray-900 px-4 py-2 font-pixel text-[8px] uppercase tracking-wider text-yellow-300 shadow-lg transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      ✦ Updated
    </div>
  );
}
