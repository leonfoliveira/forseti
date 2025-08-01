import { expect, test } from "@playwright/test";
import path from "node:path";
import { DateUtil } from "./util/date-utils";
import { describe } from "node:test";

describe("Default Contest E2E Tests", () => {
  const baseURL = "http://localhost:3000";
  let slug = "contest";

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test("Root creates and starts a contest", async ({ page }) => {
    // Redirect to root sign-in page
    await page.getByRole("button", { name: "Enter as Root" }).click();
    await expect(page).toHaveURL(`${baseURL}/root/sign-in`);

    // Sign in as root
    await page.getByLabel("Password").fill("judge");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(`${baseURL}/root/contests`);

    // Redirect to new contest page
    await page.getByRole("button", { name: "New" }).click();
    await expect(page).toHaveURL(`${baseURL}/root/contests/new`);

    // Fill in form
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Title").fill("Test Contest");
    await page.getByLabel("Python 3.13.3").click();
    await page
      .getByLabel("Start at")
      .fill(DateUtil.toDateInputFormat(new Date(Date.now() + 1000 * 60 * 60)));
    await page
      .getByLabel("End at")
      .fill(
        DateUtil.toDateInputFormat(new Date(Date.now() + 1000 * 60 * 60 * 2))
      );

    await page.getByTestId("member-add").click();
    await page.getByLabel("Type").first().selectOption({ label: "CONTESTANT" });
    await page.getByLabel("Name").first().fill("Contestant");
    await page.getByLabel("Login").first().fill("contestant");
    await page.getByLabel("Password").first().fill("contestant");

    await page.getByTestId("member-add").click();
    await page.getByLabel("Type").last().selectOption({ label: "JURY" });
    await page.getByLabel("Name").last().fill("Jury");
    await page.getByLabel("Login").last().fill("jury");
    await page.getByLabel("Password").last().fill("jury");

    await page.getByTestId("problem-add").click();
    await page.getByLabel("Title").last().fill("Two Sum");
    await page
      .getByLabel("Description")
      .setInputFiles([path.join(__dirname, "./files/description.pdf")]);
    await page.getByLabel("Time limit (ms)").fill("1000");
    await page.getByLabel("Memory limit (MB)").fill("512");
    await page
      .getByLabel("Test cases")
      .setInputFiles([path.join(__dirname, "./files/test_cases.csv")]);

    // Save the contest
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page).not.toHaveURL(`${baseURL}/root/contests/new`);

    // Start the contest
    await page.goto(`${baseURL}/root/contests`);
    const row = page.locator(`tr:has(td:first-child:text-is("${slug}"))`);
    await row.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(row.locator("td").nth(4)).toHaveText("In Progress");
  });

  test("Contestant submit solutions and clarifications", async ({ page }) => {
    // Redirect to contestant sign-in page
    await page.getByLabel("Contest").fill(slug);
    await page.getByRole("button", { name: "Join Contest" }).click();
    await expect(page).toHaveURL(`${baseURL}/contests/${slug}/sign-in`);

    // Sign in as contestant
    await page.getByLabel("Login").fill("contestant");
    await page.getByLabel("Password").fill("contestant");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(
      `${baseURL}/contests/${slug}/contestant/leaderboard`
    );

    // Make submissions
    await page.getByText("Submissions").click();
    await page.getByLabel("Language").selectOption({ label: "Python 3.13.3" });
    const rowsLength = await page.locator("tr").count();

    await page.getByLabel("Problem").selectOption({ label: "A. Two Sum" });
    await page
      .getByLabel("Code")
      .setInputFiles([path.join(__dirname, "./files/code_wrong_answer.py")]);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.locator("tr").nth(rowsLength).locator("td").nth(3)
    ).toHaveText("Wrong answer");

    await page.getByLabel("Problem").selectOption({ label: "A. Two Sum" });
    await page
      .getByLabel("Code")
      .setInputFiles([
        path.join(__dirname, "./files/code_time_limit_exceeded.py"),
      ]);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page
        .locator("tr")
        .nth(rowsLength + 1)
        .locator("td")
        .nth(3)
    ).toHaveText("Time limit exceeded");

    await page.getByLabel("Problem").selectOption({ label: "A. Two Sum" });
    await page
      .getByLabel("Code")
      .setInputFiles([path.join(__dirname, "./files/code_runtime_error.py")]);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page
        .locator("tr")
        .nth(rowsLength + 2)
        .locator("td")
        .nth(3)
    ).toHaveText("Runtime error");

    await page.getByLabel("Problem").selectOption({ label: "A. Two Sum" });
    await page
      .getByLabel("Code")
      .setInputFiles([
        path.join(__dirname, "./files/code_memory_limit_exceeded.py"),
      ]);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page
        .locator("tr")
        .nth(rowsLength + 3)
        .locator("td")
        .nth(3)
    ).toHaveText("Memory limit exceeded");

    await page.getByLabel("Problem").selectOption({ label: "A. Two Sum" });
    await page
      .getByLabel("Code")
      .setInputFiles([path.join(__dirname, "./files/code_accepted.py")]);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page
        .locator("tr")
        .nth(rowsLength + 4)
        .locator("td")
        .nth(3)
    ).toHaveText("Accepted");

    // Make clarifications
    await page.getByText("Clarifications").click();
    await page
      .getByLabel("Problem (optional)")
      .selectOption({ label: "A. Two Sum" });
    await page.getByLabel("Text").fill("Could you clarify the input format?");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("Contestant | Problem A")).toBeVisible();
    await expect(
      page.getByText("Could you clarify the input format?").first()
    ).toBeVisible();
  });

  test("Jury judges solutions", async ({ page }) => {});
});
