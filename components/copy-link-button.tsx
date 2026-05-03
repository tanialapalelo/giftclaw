"use client";

import { useState } from "react";
import { PixelButton } from "@/components/ui/pixel-button";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    // Reset setelah 2 detik
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PixelButton
      onClick={handleCopy}
      className="w-full bg-white text-gray-900 hover:bg-gray-100"
    >
      {copied ? "✓ LINK COPIED!" : "📋 COPY CLAW LINK"}
    </PixelButton>
  );
}
