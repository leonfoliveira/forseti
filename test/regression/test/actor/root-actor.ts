import { expect, Page } from "@playwright/test";

import { Actor } from "@/test/actor/actor";
import { Member } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";
import { CLI } from "@/test/util/cli";
import { FileUtil } from "@/test/util/file-util";

import { config } from "../../config";

export class RootActor extends Actor {
  constructor(page: Page, slug: string, member: Member) {
    super(page, slug, member);
  }

  async createContest(): Promise<string> {
    return await CLI.run([
      "contest",
      "create",
      this.slug,
      "--api-url",
      config.API_URL,
    ]);
  }

  async deleteContest(contestId: string) {
    await CLI.run([
      "contest",
      "delete",
      contestId,
      "--api-url",
      config.API_URL,
    ]);
  }

  async addProblem(problem: Problem) {
    const settingsNav = this.page.getByTestId("settings-nav");
    await settingsNav.getByRole("tab", { name: "Problems" }).click();
    await expect(this.page.getByTestId("problems-settings")).toBeVisible();
    await this.page
      .getByRole("button", { name: /Add( First)? Problem/ })
      .click();
    await this.page.getByLabel("Title").last().fill(problem.title);
    await this.page
      .getByTestId("description-input")
      .last()
      .setInputFiles(FileUtil.loadFile(problem.descriptionFile));
    await this.page
      .getByTestId("test-cases-input")
      .last()
      .setInputFiles(FileUtil.loadFile(problem.testCasesFile));
    await this.page
      .getByRole("textbox", { name: "Time Limit" })
      .last()
      .fill(String(problem.timeLimit));
    await this.page
      .getByRole("textbox", { name: "Memory Limit" })
      .last()
      .fill(String(problem.memoryLimit));

    await this.page.getByRole("button", { name: "Save Changes" }).click();
    await this.page.getByRole("button", { name: "Confirm" }).click();
  }

  async addMember(member: Member) {
    const settingsNav = this.page.getByTestId("settings-nav");
    await settingsNav.getByRole("tab", { name: "Members" }).click();
    await expect(this.page.getByTestId("members-settings")).toBeVisible();
    await this.page
      .getByRole("button", { name: /Add( First)? Member/ })
      .click();
    await this.page
      .getByLabel("Type")
      .last()
      .selectOption({ label: member.type });
    await this.page.getByLabel("Name").last().fill(member.name);
    await this.page.getByLabel("Login").last().fill(member.login);
    await this.page.getByLabel("Password").last().fill(member.password);
    await this.page.getByRole("button", { name: "Save Changes" }).click();
    await this.page.getByRole("button", { name: "Confirm" }).click();
  }

  async forceStart() {
    const settingsNav = this.page.getByTestId("settings-nav");
    await settingsNav.getByRole("tab", { name: "Contest" }).click();
    await expect(this.page.getByTestId("contest-settings")).toBeVisible();
    await this.page.getByRole("button", { name: "Force Start Now" }).click();
    await this.page.getByRole("button", { name: "Confirm" }).click();
    await expect(this.page.getByText("Contest has started.")).toBeVisible();
  }

  async forceEnd() {
    const settingsNav = this.page.getByTestId("settings-nav");
    await settingsNav.getByRole("tab", { name: "Contest" }).click();
    await expect(this.page.getByTestId("contest-settings")).toBeVisible();
    await this.page.getByRole("button", { name: "Force End Now" }).click();
    await this.page.getByRole("button", { name: "Confirm" }).click();
    await expect(this.page.getByText("Contest has ended.")).toBeVisible();
  }
}
