import { test, expect } from "@playwright/test";

// ─── Learning Mode ────────────────────────────────────────────────────────────

test("learning mode quiz shows Check Answer button and feedback", async ({ page }) => {
  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  // Enable learning mode by clicking the "Learning Mode" button in the quiz experience card
  await page.getByRole("button", { name: "Learning Mode" }).click();

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // Check Answer button should be visible before selecting an answer
  await expect(page.getByRole("button", { name: "Check Answer" })).toBeVisible();

  // Next button should NOT be visible before checking
  await expect(page.getByRole("button", { name: "Next →" })).toHaveCount(0);

  // Select an answer
  const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
  await firstChoice.click();

  // Click Check Answer
  await page.getByRole("button", { name: "Check Answer" }).click();

  // Feedback panel should appear (look for "Learning Feedback" kicker text)
  await expect(page.getByText("Learning Feedback")).toBeVisible();

  // Inputs should be disabled after checking
  await expect(firstChoice).toBeDisabled();

  // Next button should now be visible
  await expect(page.getByRole("button", { name: "Next →" })).toBeVisible();
});

test("learning mode quiz can be completed and reaches results", async ({ page }) => {
  // 10 questions × API call each:allow generous time
  test.setTimeout(120_000);

  await page.goto("/configure?cert=datadog-fundamentals");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  // Enable learning mode
  await page.getByRole("button", { name: "Learning Mode" }).click();

  // Use the smallest preset (10 questions)
  await page.getByRole("button", { name: "10" }).click();

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // Read the total question count from the header pill (e.g. "Question 1 of 10")
  const countPill = page.locator("div").filter({ hasText: /^Question 1 of \d+$/ }).first();
  await expect(countPill).toBeVisible();
  const pillText = await countPill.innerText();
  const totalMatch = pillText.match(/of (\d+)/);
  const totalQuestions = totalMatch ? parseInt(totalMatch[1], 10) : 10;

  for (let i = 0; i < totalQuestions; i++) {
    const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
    await firstChoice.click();

    await page.getByRole("button", { name: "Check Answer" }).click();
    await expect(page.getByText("Learning Feedback")).toBeVisible();

    const isLastQuestion = i === totalQuestions - 1;
    if (isLastQuestion) {
      // On the last question after checking, "Finish & Submit" replaces "Check Answer"
      await page.getByRole("button", { name: "Finish & Submit" }).click();
    } else {
      await page.getByRole("button", { name: "Next →" }).click();
    }
  }

  // The "Finish & Submit" button opened the submit dialog; confirm submission
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Quiz Results")).toBeVisible();
});

test("learning mode for servicenow-csa works end to end", async ({ page }) => {
  // 10 questions × API call each:allow generous time
  test.setTimeout(120_000);

  await page.goto("/configure?cert=servicenow-csa");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/configure/);

  // Enable learning mode
  await page.getByRole("button", { name: "Learning Mode" }).click();

  // Use the smallest preset (10 questions)
  await page.getByRole("button", { name: "10" }).click();

  await page.getByRole("button", { name: "Start Quiz" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // Read the total question count from the header pill (e.g. "Question 1 of 10")
  const countPill = page.locator("div").filter({ hasText: /^Question 1 of \d+$/ }).first();
  await expect(countPill).toBeVisible();
  const pillText = await countPill.innerText();
  const totalMatch = pillText.match(/of (\d+)/);
  const totalQuestions = totalMatch ? parseInt(totalMatch[1], 10) : 10;

  for (let i = 0; i < totalQuestions; i++) {
    const firstChoice = page.locator('[role="radio"], [role="checkbox"]').first();
    await firstChoice.click();

    await page.getByRole("button", { name: "Check Answer" }).click();
    await expect(page.getByText("Learning Feedback")).toBeVisible();

    const isLastQuestion = i === totalQuestions - 1;
    if (isLastQuestion) {
      // On the last question after checking, "Finish & Submit" replaces "Check Answer"
      await page.getByRole("button", { name: "Finish & Submit" }).click();
    } else {
      await page.getByRole("button", { name: "Next →" }).click();
    }
  }

  // The "Finish & Submit" button opened the submit dialog; confirm submission
  // Must reach results:this validates the certificationId fix works in learning mode too
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByText("Quiz Results")).toBeVisible();
});
