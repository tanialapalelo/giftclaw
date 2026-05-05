import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom = simulate browser (window, document, localStorage) in Node.js environment
    environment: "jsdom",

    // Setup file runs before every test file
    // where we setup @testing-library/jest-dom matchers
    setupFiles: ["./tests/setup.ts"],

    // Glob pattern: all *.test.ts or *.spec.ts
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],

    globals: true,

    // Path alias — same with tsconfig @/ → src/
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
