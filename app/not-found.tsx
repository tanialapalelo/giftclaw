import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-1">
          <p className="font-pixel text-6xl text-white tracking-widest">404</p>
          <p className="font-pixel text-[10px] text-yellow-400 tracking-widest animate-blink">
            GAME OVER
          </p>
        </div>

        <div className="border border-white/10 bg-white/5 rounded p-6 max-w-xs mx-auto">
          <p className="font-pixel text-[8px] text-gray-400 leading-loose">
            LEVEL NOT FOUND
          </p>
          <p className="font-body text-sm text-gray-400 mt-2">
            This profile doesn't exist or has been removed.
          </p>
        </div>

        <div className="font-pixel text-[8px] text-gray-600 space-y-1">
          <p>SCORE: 000000</p>
          <p>HI-SCORE: 999999</p>
        </div>

        <Link href="/">
          <button className="font-pixel text-[10px] bg-yellow-400 text-gray-900 px-8 py-3 border-b-4 border-r-4 border-yellow-600 border-t-2 border-l-2 border-yellow-200 active:translate-y-[2px] transition-all hover:bg-yellow-300">
            ↻ CONTINUE?
          </button>
        </Link>
      </div>
    </div>
  );
}
