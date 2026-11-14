import { expect, test } from "@playwright/test";

const stamp = Date.now();

test("a new learner registers, onboards and completes a flashcard session with the keyboard", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Learner");
  await page.getByLabel("Email").fill(`e2e-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Let's set you up" })).toBeVisible();
  await page.getByLabel(/^5 minutes/).check({ force: true });
  await page.getByRole("button", { name: "Start learning" }).click();

  await expect(page.getByRole("link", { name: "Start learning" })).toBeVisible();
  await page.getByRole("link", { name: "Start learning" }).click();

  const total = 3; // 5-minute goal introduces 3 new words per day
  for (let i = 0; i < total; i++) {
    await expect(page.getByTestId("card-term")).toBeVisible();
    await expect(page.getByTestId("card-answer")).toHaveCount(0);
    await page.keyboard.press("Space");
    await expect(page.getByTestId("card-answer")).toBeVisible();
    await page.keyboard.press("3");
  }
  await expect(page.getByRole("heading", { name: "Session complete" })).toBeVisible();

  await page.getByRole("link", { name: "Back to today" }).click();
  await expect(page.getByText("You're all caught up")).toBeVisible();
  await expect(page.getByRole("link", { name: "Start learning" })).toHaveCount(0);
});

test("learners cannot open the admin area, admins can create a word", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Plain User");
  await page.getByLabel("Email").fill(`plain-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("dev-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
  await page.goto("/admin/words/new");
  await page.getByLabel(/^Term/).fill(`e2eword${stamp}`);
  await page.getByLabel(/^Vietnamese meaning/).fill("từ thử nghiệm");
  await page.getByLabel(/^Simple English definition/).fill("A word created by an automated test.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/admin\/words\/\d+/);
  await page.goto("/admin/words");
  await expect(page.getByText(`e2eword${stamp}`)).toBeVisible();
});

test("quick quiz gives feedback and a score, and progress shows history", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Quiz User");
  await page.getByLabel("Email").fill(`quiz-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Start learning" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/quiz");
  for (let i = 0; i < 5; i++) {
    await expect(page.getByTestId("quiz-term")).toBeVisible();
    await page.getByRole("listitem").getByRole("button").first().click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.getByRole("button", { name: i === 4 ? "See result" : "Next", exact: true }).click();
  }
  await expect(page.getByTestId("quiz-score")).toContainText("/ 5");

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
  await expect(page.getByText("No reviews yet.")).toBeVisible();
});
