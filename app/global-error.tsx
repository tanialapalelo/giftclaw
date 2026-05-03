"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Nanti diganti Sentry.captureException(error) di Block testing-ci
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="space-y-1">
            <p className="font-pixel text-4xl text-red-400">ERROR</p>
            <p className="font-pixel text-[10px] text-red-400 tracking-widest">
              CRITICAL FAILURE
            </p>
          </div>

          <div className="border border-red-400/20 bg-red-400/5 rounded p-6 max-w-xs mx-auto">
            <p className="font-body text-sm text-gray-400 mt-2">
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest && (
              <p className="font-pixel text-[7px] text-gray-600 mt-2">
                ID: {error.digest}
              </p>
            )}
          </div>

          <button
            onClick={reset}
            className="font-pixel text-[10px] bg-yellow-400 text-gray-900 px-8 py-3 border-b-4 border-r-4 border-yellow-600 border-t-2 border-l-2 border-yellow-200 active:translate-y-[2px] transition-all hover:bg-yellow-300"
          >
            ↻ TRY AGAIN
          </button>
        </div>
      </body>
    </html>
  );
}
