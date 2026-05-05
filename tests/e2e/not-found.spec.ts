import { test, expect } from "@playwright/test";

test.describe("404 Handling", () => {
  test("/friends/random-string → 404", async ({ page }) => {
    await page.goto("/friends/random-string");
    // Next.js not-found.tsx render
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("/play/random-string → 404", async ({ page }) => {
    await page.goto("/play/random-string");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("/friends/valid-uuid-but-not-exist → 404", async ({ page }) => {
    await page.goto("/friends/a3f2c1d0-4e5f-4a6b-8c9d-0e1f2a3b4c5d");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
