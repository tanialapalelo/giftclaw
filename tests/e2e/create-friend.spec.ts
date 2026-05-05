// we use e2e test to simulate real user behavior: fill form, submit, check URL, check page content after redirect
import { test, expect } from "@playwright/test";

test.describe("Create Friend Flow", () => {
  test("happy path: create profile → redirect to friend page", async ({
    page,
  }) => {
    await page.goto("/friends/new");

    // fill name
    await page.fill('input[name="name"]', "Sarah");

    // fill interests, input with placeholder "gaming" → type "gaming" → press Enter to add tag
    await page.fill('input[placeholder*="gaming"]', "gaming");
    await page.keyboard.press("Enter");

    // submit form
    await page.click('button[type="submit"]');

    // after submit → redirect ke /friends/[id]
    // wait for URL changes (max 5 second)
    await expect(page).toHaveURL(/\/friends\/[0-9a-f-]{36}/, { timeout: 5000 });

    // friend page shows name
    await expect(page.getByText("Sarah")).toBeVisible();
  });

  test("shows error when name is empty", async ({ page }) => {
    await page.goto("/friends/new");

    // submit without fill anything
    await page.click('button[type="submit"]');

    // error message is shown
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test("shows error when no interests added", async ({ page }) => {
    await page.goto("/friends/new");
    await page.fill('input[name="name"]', "Sarah");
    await page.click('button[type="submit"]');

    await expect(page.getByText(/interest/i)).toBeVisible();
  });
});
