"use client";

import { useEffect, useMemo, useState } from "react";
import type { Theme } from "@/lib/themes";
import type { GameResultWithGift } from "@/lib/actions/game";

const MESSAGES_INTRO = [
  "👾 YO! I'm CLAWBOT, your gift-finding companion!",
  "🎯 You get UP TO 3 GRABS to find the perfect gift!",
  "🕹️ Move the claw left/right, then smash GRAB!",
];

function buildMessages(
  friendName: string,
  previousResults: GameResultWithGift[] | null
): string[] {
  const msgs = [...MESSAGES_INTRO];
  if (previousResults && previousResults.length > 0) {
    msgs.push("🔄 Each grab reveals a different gift — choose wisely!");
  } else {
    msgs.push(`🎁 Let's find an amazing gift for ${friendName}!`);
  }
  msgs.push("✅ Hit LET'S GO when you're ready!");
  return msgs;
}

export function MascotBot({
  friendName,
  previousResults,
  theme,
  onDismiss,
}: {
  friendName: string;
  previousResults: GameResultWithGift[] | null;
  theme: Theme;
  onDismiss: () => void;
}) {
  const messages = useMemo(
    () => buildMessages(friendName, previousResults),
    [friendName, previousResults]
  );
  const [msgIndex, setMsgIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    setDisplayed("");
    setTyping(true);
    const msg = messages[msgIndex];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(msg.slice(0, i));
      if (i >= msg.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [msgIndex, messages]);

  const handleNext = () => {
    if (typing) {
      // Skip typewriter — show full message instantly
      setDisplayed(messages[msgIndex]);
      setTyping(false);
      return;
    }
    if (msgIndex < messages.length - 1) {
      setMsgIndex((i) => i + 1);
    } else {
      onDismiss();
    }
  };

  const isLast = msgIndex === messages.length - 1 && !typing;

  const isDark = theme.isDark;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
      onClick={handleNext}
    >
      {/* X skip button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border-2 font-pixel text-sm transition-all active:scale-90 ${
          isDark
            ? "border-yellow-400 bg-gray-900 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900"
            : "border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
        }`}
        aria-label="Skip intro"
      >
        ✕
      </button>

      {/* Stop propagation on inner card so only clicking the button dismisses */}
      <div
        className="w-full max-w-sm animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bot sprite */}
        <div className="flex justify-center mb-2">
          <div
            className={`relative w-16 h-16 rounded-lg border-4 flex items-center justify-center text-3xl select-none ${
              isDark
                ? "border-yellow-400 bg-gray-900"
                : "border-gray-900 bg-white"
            }`}
            style={{ imageRendering: "pixelated" }}
          >
            👾
            {/* Blinking eyes overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex gap-2 mt-1">
                <div
                  className="h-1 w-1 rounded-full bg-current animate-blink"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="h-1 w-1 rounded-full bg-current animate-blink"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
            {/* Antenna */}
            <div
              className={`absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 ${isDark ? "bg-yellow-400" : "bg-gray-900"}`}
            />
            <div
              className={`absolute -top-5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-blink ${isDark ? "bg-yellow-400" : "bg-gray-900"}`}
            />
          </div>
        </div>

        {/* Speech bubble */}
        <div
          className={`relative rounded-2xl px-5 py-4 border-4 shadow-2xl ${
            isDark
              ? "bg-gray-900 border-yellow-400 text-yellow-300"
              : "bg-white border-gray-900 text-gray-900"
          }`}
        >
          {/* Triangle pointer */}
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent ${
              isDark ? "border-b-yellow-400" : "border-b-gray-900"
            }`}
          />

          {/* Progress dots */}
          <div className="flex gap-1 mb-3 justify-center">
            {messages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i <= msgIndex
                    ? isDark
                      ? "bg-yellow-400"
                      : "bg-gray-900"
                    : isDark
                      ? "bg-gray-600"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Message */}
          <p
            className={`font-pixel text-[10px] leading-relaxed min-h-[3rem] ${
              isDark ? "text-yellow-100" : "text-gray-800"
            }`}
          >
            {displayed}
            {typing && (
              <span className="animate-blink ml-0.5 font-body">▌</span>
            )}
          </p>

          {/* Button */}
          <button
            onClick={handleNext}
            className={`mt-4 w-full rounded-lg py-2.5 font-pixel text-[9px] tracking-widest transition-all active:scale-95 ${
              isDark
                ? "bg-yellow-400 text-gray-900 hover:bg-yellow-300"
                : "bg-gray-900 text-white hover:bg-gray-700"
            } ${isLast ? "animate-blink" : ""}`}
          >
            {typing ? "▶ SKIP" : isLast ? "✦ LET'S GO!" : "▶ NEXT"}
          </button>
        </div>
      </div>
    </div>
  );
}
