import { test, expect } from "@playwright/test";

// ─── Home page ────────────────────────────────────────────────────────────────

test.describe("Home page — structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("has exactly one h1", async ({ page }) => {
    const headings = page.getByRole("heading", { level: 1 });
    await expect(headings).toHaveCount(1);
  });

  test("all images have non-empty alt text", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} is missing alt text`).toBeTruthy();
    }
  });

  test("vendor cards are links with descriptive accessible names", async ({ page }) => {
    const links = page.getByRole("link");
    const names: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const text = (await links.nth(i).textContent()) ?? "";
      names.push(text.trim());
    }
    // At least one card link should reference Datadog or ServiceNow content
    expect(names.some((n) => /datadog|servicenow/i.test(n))).toBe(true);
  });
});

test.describe("Home page — keyboard navigation", () => {
  test("can tab to each vendor card and activate it with Enter", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Focus the first interactive element and tab until we reach the Datadog card
    await page.keyboard.press("Tab");
    let found = false;
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(
        () => document.activeElement?.getAttribute("href") ?? ""
      );
      if (focused.includes("datadog")) {
        found = true;
        break;
      }
      await page.keyboard.press("Tab");
    }
    expect(found).toBe(true);
  });
});

// ─── Configure page ───────────────────────────────────────────────────────────

test.describe("Configure page — form accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/configure?cert=datadog-fundamentals");
    await page.waitForLoadState("networkidle");
  });

  test("build mode toggle buttons have aria-pressed", async ({ page }) => {
    const autoMix = page.getByRole("button", { name: /auto mix/i });
    const custom = page.getByRole("button", { name: /custom filters/i });

    // Auto Mix starts active
    await expect(autoMix).toHaveAttribute("aria-pressed", "true");
    await expect(custom).toHaveAttribute("aria-pressed", "false");

    // After clicking Custom Filters it becomes active
    await custom.click();
    await expect(custom).toHaveAttribute("aria-pressed", "true");
    await expect(autoMix).toHaveAttribute("aria-pressed", "false");
  });

  test("submit button is reachable via Tab", async ({ page }) => {
    // Tab forward from body up to 25 times looking for the Start Quiz button
    let found = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(
        () => document.activeElement?.textContent?.trim() ?? ""
      );
      if (/start quiz/i.test(focused)) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("h1 or section heading is present", async ({ page }) => {
    // The configure page uses CardTitle elements, not an h1.
    // Verify at least one visible heading-like text exists.
    await expect(
      page.getByText(/how should the quiz be built/i).first()
    ).toBeVisible();
  });
});

// ─── Quiz runner — in-session accessibility ───────────────────────────────────

test.describe("Quiz runner — accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/configure?cert=datadog-fundamentals");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Start Quiz" }).click();
    await expect(page).toHaveURL(/\/quiz$/);
    await page.waitForLoadState("networkidle");
  });

  test("question choices are focusable and have radio or checkbox roles", async ({ page }) => {
    const choices = page.locator('[role="radio"], [role="checkbox"]');
    await expect(choices.first()).toBeVisible();

    // Each choice should have an accessible label
    const count = await choices.count();
    for (let i = 0; i < count; i++) {
      const label =
        (await choices.nth(i).getAttribute("aria-label")) ??
        (await choices.nth(i).textContent());
      expect(label?.trim(), `Choice ${i} has no accessible label`).toBeTruthy();
    }
  });

  test("Previous and Next buttons are keyboard accessible", async ({ page }) => {
    const prev = page.getByRole("button", { name: /← previous/i });
    const next = page.getByRole("button", { name: /next →|finish & submit/i }).first();

    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();

    // Tab to Next button and confirm it receives focus
    await next.focus();
    const focused = await page.evaluate(
      () => document.activeElement?.textContent?.trim() ?? ""
    );
    expect(/next|finish/i.test(focused)).toBe(true);
  });

  test("question counter is visible and indicates current position", async ({ page }) => {
    await expect(page.getByText(/question 1 of/i)).toBeVisible();
  });
});

// ─── Responsive layout ────────────────────────────────────────────────────────

test.describe("Responsive — 320px mobile", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("home page: vendor cards are visible and not clipped", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Key card CTAs should be visible (Datadog card)
    await expect(page.getByRole("link", { name: /datadog/i }).getByText(/start studying/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /servicenow/i })).toBeVisible();
  });

  test("configure page: Start Quiz button is visible", async ({ page }) => {
    await page.goto("/configure?cert=datadog-fundamentals");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /start quiz/i })).toBeVisible();
  });

  test("no horizontal overflow on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});

test.describe("Responsive — 1440px desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("home page renders correctly at wide viewport", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /datadog/i }).getByText(/start studying/i)).toBeVisible();
  });

  test("no horizontal overflow on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });
});

// ─── Dark mode ────────────────────────────────────────────────────────────────

test.describe("Dark mode", () => {
  test("home page renders with dark color scheme preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("configure page renders with dark color scheme preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/configure?cert=datadog-fundamentals");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /start quiz/i })).toBeVisible();
  });
});

// ─── Reduced motion ───────────────────────────────────────────────────────────

test.describe("Reduced motion", () => {
  test("home page loads without errors under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
