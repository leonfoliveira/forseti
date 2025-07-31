import { expect, test } from "@playwright/test";
import path from "node:path";
import { DateUtil } from "./util/date-utils";

const baseURL = "http://localhost:3000";
const slug = Math.random().toString(36).substring(2, 15);

test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
});

test("Root creates a contest", async ({ page }) => {
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
});
