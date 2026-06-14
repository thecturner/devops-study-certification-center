import { test, expect } from "@playwright/test";

// ─── Datadog Fundamentals ─────────────────────────────────────────────────────

test("user can generate a datadog quiz and reach results", async ({ page }) => {
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();

  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Quiz Results")).toBeVisible();
});

test("user can return home and resume or abandon an in-progress test", async ({ page }) => {
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);

  await expect(page.getByText("You have an in-progress test.")).toBeVisible();
  await page.getByRole("link", { name: "Resume Test" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  await page.getByRole("button", { name: "Abandon Test" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Abandon Test" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("You have an in-progress test.")).toHaveCount(0);
});

// ─── ServiceNow quiz submit ───────────────────────────────────────────────────

test("user can complete a servicenow-csa quiz and reach results", async ({ page }) => {
  await page.goto("/configure?cert=servicenow-csa");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // Answer the current question
  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();

  // Submit
  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();

  // Must reach results (this was broken before the certificationId fix)
  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Quiz Results")).toBeVisible();
});

test("servicenow quiz shows correct branding in header", async ({ page }) => {
  await page.goto("/configure?cert=servicenow-csa");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // ServiceNow lockup renders as text in the header, not the Datadog image
  await expect(page.locator("header").getByText("ServiceNow", { exact: true })).toBeVisible();
  const datadogImg = page.locator('img[alt="Datadog"]');
  await expect(datadogImg).toHaveCount(0);
});

// ─── Results page navigation guards ──────────────────────────────────────────

test("New Quiz button navigates to configure without triggering home redirect", async ({ page }) => {
  // Complete a quiz to get to results
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Start Quiz" }).click();
  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();
  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/results$/);

  // Click New Quiz: must go to /configure, NOT flash to /
  await page.getByRole("button", { name: "New Quiz" }).click();
  await expect(page).toHaveURL(/\/configure/);
  // Verify we did not land on home at any point (no in-progress card visible)
  await expect(page.getByText("You have an in-progress test.")).toHaveCount(0);
});

test("Retry Missed Questions navigates to quiz without triggering home redirect", async ({ page }) => {
  // Complete a quiz and intentionally answer wrong to get missed questions
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // Don't answer; unanswered questions count as incorrect, guaranteeing missed questions
  await page.getByRole("button", { name: "Submit Quiz" }).first().click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/results$/);

  // Retry Missed button should be enabled (we missed at least 1 question)
  const retryButton = page.getByRole("button", { name: "Retry Missed Questions" });
  await expect(retryButton).toBeVisible();
  await expect(retryButton).not.toBeDisabled();

  // Click it: must go directly to /quiz, NOT redirect to /
  await retryButton.click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByText("Quiz Results")).toHaveCount(0);
});
