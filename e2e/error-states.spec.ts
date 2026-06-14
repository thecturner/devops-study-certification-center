import { test, expect } from "@playwright/test";

// ─── Grade API error states ───────────────────────────────────────────────────

test("grade API failure keeps user on quiz page", async ({ page }) => {
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();

  await page.route("**/api/quiz/grade", (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ error: "server error" }) })
  );

  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText(/Grading failed/)).toBeVisible();
  await expect(page).toHaveURL(/\/quiz$/);

  const submitButton = page.getByRole("button", { name: "Submit Quiz" }).first();
  await expect(submitButton).toBeVisible();
  await expect(submitButton).not.toBeDisabled();
});

test("network error on grade keeps user on quiz page", async ({ page }) => {
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();

  await page.route("**/api/quiz/grade", (route) => route.abort());

  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText(/Network error/)).toBeVisible();
  await expect(page).toHaveURL(/\/quiz$/);

  const submitButton = page.getByRole("button", { name: "Submit Quiz" }).first();
  await expect(submitButton).toBeVisible();
  await expect(submitButton).not.toBeDisabled();
});

test("grade API 422 (invalid payload) keeps user on quiz page", async ({ page }) => {
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();

  await page.route("**/api/quiz/grade", (route) =>
    route.fulfill({ status: 422, body: JSON.stringify({ error: "invalid" }) })
  );

  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText(/Grading failed/)).toBeVisible();
  await expect(page).toHaveURL(/\/quiz$/);

  const submitButton = page.getByRole("button", { name: "Submit Quiz" }).first();
  await expect(submitButton).toBeVisible();
  await expect(submitButton).not.toBeDisabled();
});
