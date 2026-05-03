"use client";

import Link from "next/link";

export function ErrorDisplay({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <p className="font-pixel text-2xl text-red-400">OOPS!</p>

        <div className="border border-red-400/20 bg-red-400/5 rounded p-6">
          <p className="font-pixel text-[8px] text-gray-400 leading-loose mb-2">
            SOMETHING WENT WRONG
          </p>
          <p className="font-body text-sm text-gray-400">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="font-pixel text-[7px] text-gray-600 mt-2">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="font-pixel text-[9px] bg-yellow-400 text-gray-900 px-6 py-3 border-b-4 border-r-4 border-yellow-600 border-t-2 border-l-2 border-yellow-200 active:translate-y-[2px] transition-all"
          >
            ↻ RETRY
          </button>
          <Link href="/">
            <button className="font-pixel text-[9px] bg-white/10 text-white px-6 py-3 border border-white/20 hover:bg-white/20 transition-all">
              ← HOME
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
