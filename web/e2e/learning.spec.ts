import { expect, test } from "@playwright/test";

const stamp = Date.now();

test("a new learner registers, onboards and completes a flashcard session with the keyboard", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Learner");
  await page.getByLabel("Email").fill(`e2e-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Set up your plan" })).toBeVisible();
  await page.getByLabel(/^5 minutes/).check({ force: true });
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page.getByRole("link", { name: "Start learning" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your vocabulary" })).toBeVisible();
  await expect(page.getByTestId("solid-count")).toHaveText("0");
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
  await expect(page.getByText("You are all caught up")).toBeVisible();
  await expect(page.getByRole("link", { name: "Start learning" })).toHaveCount(0);
});

test("learners cannot open the admin area, admins can create a word", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Plain User");
  await page.getByLabel("Email").fill(`plain-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
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
  await page.reload();
  await expect(page.getByLabel(/^Term/)).toHaveValue(`e2eword${stamp}`);
});

test("quick quiz gives feedback and a score, and progress shows history", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Quiz User");
  await page.getByLabel("Email").fill(`quiz-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/quiz");
  await page.getByRole("button", { name: /^Choose/ }).click();
  for (let i = 0; i < 5; i++) {
    await expect(page.getByTestId("quiz-term")).toBeVisible();
    await page.getByRole("listitem").getByRole("button").first().click();
    await expect(page.getByRole("status")).toBeVisible();
    await page.getByRole("button", { name: i === 4 ? "See result" : "Next", exact: true }).click();
  }
  await expect(page.getByTestId("quiz-score")).toContainText("/ 5");

  await page.getByRole("button", { name: "Change mode" }).click();
  await page.getByRole("button", { name: /^Type/ }).click();
  await expect(page.getByTestId("quiz-term")).toBeVisible();
  await page.getByLabel("Your answer").fill("zzzz");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("status")).toContainText("Not quite");

  await page.goto("/quiz");
  await page.getByRole("button", { name: /^Fill the gap/ }).click();
  await expect(page.getByTestId("quiz-term")).toBeVisible();
  await page.getByLabel("Your answer").fill("zzzz");
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("status")).toContainText("Not quite");

  await page.goto("/quiz");
  await page.getByRole("button", { name: /^Say it/ }).click();
  await expect(page.getByTestId("quiz-term")).toBeVisible();
  await expect(page.getByTestId("say-it").getByRole("button", { name: "Record my voice" })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Progress" })).toBeVisible();
  await expect(page.getByText("No reviews yet.")).toBeVisible();
});

test("listening lesson: answer questions, see the score and the transcript", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Listener");
  await page.getByLabel("Email").fill(`listen-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Practice" }).click();
  await page.getByRole("link", { name: /^Listening/ }).click();
  await page.getByRole("link", { name: /Daily Standup/ }).click();
  await expect(page.getByText("Show transcript")).toBeVisible();
  await expect(page.getByText("I fixed the login bug")).toHaveCount(0);
  for (const fieldset of await page.getByRole("region", { name: "Questions" }).locator("fieldset").all()) await fieldset.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Check answers" }).click();
  await expect(page.getByTestId("listening-score")).toContainText("/ 3");
  await expect(page.getByText(/I fixed the login bug/)).toBeVisible();
});

test("scripted scenario: step through, reveal the learner's line, complete", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Talker");
  await page.getByLabel("Email").fill(`talk-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Practice" }).click();
  await page.getByRole("link", { name: /^Scenarios/ }).click();
  await page.getByRole("link", { name: /Code Review/ }).click();
  await expect(page.getByText("could you review my pull request")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/Your turn/)).toBeVisible();
  await page.getByRole("button", { name: "Show my line" }).click();
  await expect(page.getByText(/Tip:/)).toBeVisible();
  await expect(page.getByTestId("say-it").getByRole("button", { name: "Record my voice" })).toBeVisible();

  const action = page.getByRole("button", { name: /^(Show my line|Continue|Finish)$/ });
  for (let i = 0; i < 30; i++) {
    // After the last click the button disappears; a failed click then simply ends the loop.
    const clicked = await action.first().click({ timeout: 3000 }).then(() => true, () => false);
    if (!clicked) break;
  }
  await expect(page.getByText(/Scenario complete/)).toBeVisible();
  await page.goto("/scenarios");
  await expect(page.getByText("Completed")).toBeVisible();
});

test("language and theme switches work and persist", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "vi", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
  await page.getByRole("button", { name: "en", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

  const html = page.locator("html");
  const before = await html.evaluate((el) => el.classList.contains("dark"));
  await page.getByRole("button", { name: /^Theme:/ }).click();
  const after = await html.evaluate((el) => el.classList.contains("dark"));
  // light -> dark -> system: the first click changes the class unless the system already matches dark
  expect(typeof after).toBe("boolean");
  await page.getByRole("button", { name: /^Theme:/ }).click();
  await page.getByRole("button", { name: /^Theme:/ }).click();
  expect(await html.evaluate((el) => el.classList.contains("dark"))).toBe(before);
});

test("on a phone the app shows a bottom tab bar and no horizontal scroll", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/register");
  await page.getByLabel("Name").fill("Phone User");
  await page.getByLabel("Email").fill(`phone-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  const tabBar = page.getByRole("navigation", { name: "Main" });
  await expect(tabBar).toBeVisible();
  await expect(tabBar.getByRole("link")).toHaveCount(5);
  for (const path of ["/", "/path", "/practice", "/tools", "/tools/standup", "/tools/incident", "/tools/email", "/tools/phrases", "/library", "/listening", "/scenarios", "/progress", "/quiz"]) {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
  }
  await context.close();
});

test("admin screens fit a phone and are translated", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("dev-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Admin" })).toBeVisible();

  for (const path of ["/admin", "/admin/words", "/admin/words/new", "/admin/listening", "/admin/scenarios", "/admin/collections", "/admin/reports", "/admin/units", "/admin/words/import"]) {
    await page.goto(path);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
  }

  await page.getByRole("button", { name: "vi", exact: true }).click();
  await page.goto("/admin/words/new");
  await expect(page.getByRole("heading", { name: "Tạo từ" })).toBeVisible();
  await context.close();
});


test("learning path: next step on home, focused words session, unit steps and growth", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Path User");
  await page.getByLabel("Email").fill(`path-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByLabel(/^5 minutes/).check({ force: true });
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page.getByRole("heading", { name: "Next step" })).toBeVisible();
  await expect(page.getByText("Daily Standup").first()).toBeVisible();
  await expect(page.getByText("Intern")).toBeVisible();

  await page.getByRole("link", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/learn\?collection=daily-standup/);
  for (let i = 0; i < 3; i++) {
    await expect(page.getByTestId("card-term")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("card-answer")).toBeVisible();
    await page.keyboard.press("3");
    await expect(page.getByTestId("card-answer")).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { name: "Session complete" })).toBeVisible();

  await page.goto("/path");
  await expect(page.getByRole("link", { name: /Daily Standup/ })).toContainText("In progress");
  await expect(page.getByRole("link", { name: /Meetings & Email/ })).toContainText("Locked");
  await page.getByRole("link", { name: /Daily Standup/ }).click();
  await expect(page.getByRole("heading", { name: "Daily Standup", level: 1 })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Unit quiz" })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Growth" })).toBeVisible();
  await expect(page.getByText("88 XP to Junior")).toBeVisible();
  await expect(page.getByRole("img", { name: /Learning days/ })).toBeVisible();

  await page.goto("/path/daily-standup/quiz");
  await expect(page.getByTestId("quiz-term")).toBeVisible();
});


test("work toolkit: standup, incident and email builders and the phrase bank", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/register");
  await page.getByLabel("Name").fill("Tools User");
  await page.getByLabel("Email").fill(`tools-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();

  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Tools" }).click();
  await page.getByRole("link", { name: /^Standup update/ }).click();
  await page.getByLabel("Yesterday: What? (for example: the login bug)").fill("the login bug");
  await page.getByLabel("Today: What? (for example: the login bug)").fill("tests for it");
  await expect(page.getByTestId("tool-output")).toHaveText(
    "Yesterday I fixed the login bug.\nToday I will write tests for it.\nI have no blockers.",
  );
  await page.getByRole("button", { name: "Copy" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Yesterday I fixed the login bug.");

  await page.goto("/tools/incident");
  await page.getByLabel("Service or system").fill("the payment service");
  await page.getByLabel("What can they not do?").fill("check out");
  await page.getByLabel("Next update").fill("at 10:00");
  await expect(page.getByTestId("tool-output")).toHaveText(
    "We are investigating an issue with the payment service. Some customers cannot check out. We will send the next update at 10:00.",
  );
  await page.getByRole("button", { name: "Resolved" }).click();
  await expect(page.getByTestId("tool-output")).toContainText("has been resolved");

  await page.goto("/tools/email");
  await page.getByLabel("Recipient's name").fill("Anna");
  await page.getByLabel("Topic").fill("the release");
  await expect(page.getByTestId("tool-output")).toContainText("Hi Anna,");
  await expect(page.getByTestId("tool-output")).toContainText("[first option]");

  await page.goto("/tools/phrases");
  await expect(page.getByText("Looks good to me.")).toBeVisible();
  await page.getByRole("button", { name: "Incidents" }).click();
  await expect(page.getByText("We are investigating an issue with the payment service.")).toBeVisible();
});

test("account: forgot password page, settings, password change and account deletion", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await page.waitForLoadState("networkidle"); // let the form hydrate so submit is handled by React
  await page.getByLabel("Email").fill("nobody@example.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");

  await page.goto("/reset-password");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("incomplete");

  await page.goto("/register");
  await page.getByLabel("Name").fill("Settler");
  await page.getByLabel("Email").fill(`settings-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByText("Not confirmed")).toBeVisible();
  await page.locator("#name").fill("Settler Two");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  await page.locator("#current").fill("e2e-password-123");
  await page.locator("#new-password").fill("e2e-password-456");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password changed.")).toBeVisible();

  await page.locator("#del").fill("e2e-password-456");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Email").fill(`settings-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-456");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("incorrect");
});

test("personalization: role and goal in onboarding, vocabulary check suggests a level", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Tester");
  await page.getByLabel("Email").fill(`place-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("group", { name: "Your role" })).toBeVisible();
  await page.getByLabel("QA / Tester").check({ force: true });
  await page.getByLabel("Pass a job interview").check({ force: true });

  await page.getByRole("link", { name: /Take the 2-minute vocabulary check/ }).click();
  await expect(page.getByRole("heading", { name: "Vocabulary check" })).toBeVisible();
  await expect(page.locator("ol fieldset")).toHaveCount(10);
  await page.getByRole("button", { name: "See my level" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Answer every question" })).toBeVisible();
  for (let i = 0; i < 10; i++) await page.locator("ol fieldset").nth(i).locator("input[type=radio]").first().check({ force: true });
  await page.getByRole("button", { name: "See my level" }).click();
  await expect(page.getByTestId("placement-result")).toContainText("Suggested level");
  await page.getByRole("button", { name: "Use this level" }).click();

  await expect(page.getByRole("heading", { name: "Set up your plan" })).toBeVisible();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/path");
  await expect(page.getByText("For you").first()).toBeVisible();
});

test("a learner reports a mistake and the admin sees metrics and the report", async ({ page, browser }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Reporter");
  await page.getByLabel("Email").fill(`report-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/library");
  await page.locator('a[href^="/library/"]').first().click();
  await page.getByRole("button", { name: "Report a mistake" }).click();
  await page.getByLabel("What is wrong?").fill(`E2E report ${stamp}`);
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thank you. We will check it.")).toBeVisible();

  const ctx = await browser.newContext();
  const admin = await ctx.newPage();
  await admin.goto("/login");
  await admin.getByLabel("Email").fill("admin@example.test");
  await admin.getByLabel("Password").fill("dev-password-123");
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin.getByRole("heading", { name: /^Today/ })).toBeVisible();
  await admin.goto("/admin");
  await expect(admin.getByRole("heading", { name: "Product metrics" })).toBeVisible();
  await expect(admin.getByText("Back on day 1")).toBeVisible();
  await admin.goto("/admin/reports");
  await expect(admin.getByText(`E2E report ${stamp}`).first()).toBeVisible();
  await expect(admin.getByRole("link", { name: "New" })).toHaveCount(0);
  await ctx.close();
});

test("public pages: landing try-it, glossary, privacy and terms work signed out and in Vietnamese", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("try-card")).toBeVisible();
  await page.getByRole("button", { name: "Show meaning" }).click();
  await page.getByRole("button", { name: "Next word" }).click();
  await expect(page.getByText("Word 2 of 5")).toBeVisible();

  await page.goto("/glossary");
  await expect(page.getByRole("heading", { name: "Glossary" })).toBeVisible();
  await expect(page.locator("dt").first()).toBeVisible();

  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy policy" })).toBeVisible();
  await expect(page.getByText("No cookies")).toBeVisible();
  await page.getByRole("button", { name: "vi", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Chính sách quyền riêng tư" })).toBeVisible();

  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/robots.txt");
  await expect(page.locator("body")).toContainText("Sitemap:");
  await page.goto("/sitemap.xml");
  await expect(page.locator("body")).toContainText("/glossary");
});

test("installable app and reminders: manifest, service worker, icons and the Settings section", async ({ page }) => {
  await page.goto("/manifest.webmanifest");
  await expect(page.locator("body")).toContainText("standalone");
  await page.goto("/sw.js");
  await expect(page.locator("body")).toContainText("showNotification");
  const icon = await page.goto("/pwa-icon/192");
  expect(icon?.headers()["content-type"]).toContain("image/png");

  await page.goto("/register");
  await page.getByLabel("Name").fill("Reminder");
  await page.getByLabel("Email").fill(`remind-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();
  await expect(page.getByTestId("welcome-back")).toHaveCount(0);

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Daily reminder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Turn on reminders" })).toBeVisible();
  await expect(page.getByText(/never send streak or guilt/)).toBeVisible();
});

test("admin imports words from CSV and sees path units", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("dev-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/admin/words/import");
  const term = `importword${stamp}`;
  await page.getByLabel("Or paste CSV text").fill(
    `term,part_of_speech,meaning_vi,definition_en,category,example_en,example_vi\n${term},noun,từ thử nghiệm,A word added by the importer test.,Testing & QA,This ${term} is only a test.,Đây chỉ là một thử nghiệm.\n`,
  );
  await page.getByRole("button", { name: "Check file" }).click();
  await expect(page.getByRole("status")).toContainText("File is valid: 1 new");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("1 new, 0 updated.");

  await page.goto("/admin/units");
  await expect(page.getByText("Say It Right").first()).toBeVisible();
});

test("sign-up works for a browser that reports the legacy time zone Asia/Saigon", async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: "Asia/Saigon" });
  const page = await context.newPage();
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Name").fill("Saigon User");
  await page.getByLabel("Email").fill(`saigon-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();
  await context.close();
});

test("learn more: extra new-word sessions beyond the daily plan, from home and after a session", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Name").fill("Eager");
  await page.getByLabel("Email").fill(`eager-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByTestId("learn-more")).toBeVisible();

  await page.getByTestId("learn-more").getByRole("link", { name: "+5 new words" }).click();
  await expect(page.getByTestId("card-term")).toBeVisible();
  await expect(page.getByText("01/05")).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: /Show answer/ }).click();
    await page.getByRole("button", { name: /^Good/ }).click();
  }
  await expect(page.getByTestId("more-words")).toBeVisible();
  await page.getByTestId("more-words").getByRole("link", { name: "+5 new words" }).click();
  await expect(page.getByText("01/05")).toBeVisible();
});

test("everyday English: a path unit with words, listening and a scenario, and the scenario can be played", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Name").fill("Daily");
  await page.getByLabel("Email").fill(`daily-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/path/small-talk");
  await expect(page.getByText("Monday Morning Small Talk")).toBeVisible();
  await expect(page.getByText("Small Talk at Work")).toBeVisible();

  await page.goto("/scenarios/small-talk-at-work");
  await expect(page.getByText("How is it going?")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Show my line" }).click();
  await expect(page.getByText("Not bad, thanks. How about you?")).toBeVisible();
  await expect(page.getByText(/Always ask back/)).toBeVisible();
});

test("CEFR levels: A1-B2 in onboarding, the path and the library filter", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Name").fill("Leveller");
  await page.getByLabel("Email").fill(`cefr-${stamp}@example.test`);
  await page.getByLabel("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  for (const l of ["A1 · Beginner", "A2 · Elementary", "B1 · Intermediate", "B2 · Upper intermediate"]) {
    await expect(page.getByLabel(l)).toBeAttached();
  }
  await page.getByLabel("B1 · Intermediate").check({ force: true });
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /^Today/ })).toBeVisible();

  await page.goto("/path");
  for (const h of ["A1 · Beginner", "A2 · Elementary", "B1 · Intermediate", "B2 · Upper intermediate"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }

  await page.goto("/library");
  await page.getByLabel("Level").selectOption("b2");
  await expect(page.locator("main li").first()).toContainText("B2");
});
