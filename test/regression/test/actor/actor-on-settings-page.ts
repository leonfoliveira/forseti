import { expect, Page } from "@playwright/test";

import { Actor } from "@/test/actor/actor";
import { Contest } from "@/test/entity/contest";
import { Member } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";
import { FileUtil } from "@/test/util/file-util";

export class ActorOnSettingsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async openTab(tab: "contest" | "problems" | "members") {
    const tabTrigger = this.page.getByTestId(`settings-${tab}-tab-trigger`);
    await tabTrigger.click();
  }

  async fillContestForm(contest: Contest) {
    const settingsContestTab = this.page.getByTestId("settings-contest-tab");

    const slugInput = settingsContestTab.getByLabel("Slug");
    const titleInput = settingsContestTab.getByLabel("Title");
    const startAtInput = settingsContestTab.getByLabel("Start At");
    const endAtInput = settingsContestTab.getByLabel("End At");
    const languageCheckboxes = contest.languages.map((lang) =>
      settingsContestTab.getByLabel(lang),
    );
    const isAutoJudgeEnabledCheckbox =
      settingsContestTab.getByLabel("Auto Judge");

    await slugInput.fill(contest.slug);
    await titleInput.fill(contest.title);
    await startAtInput.fill(contest.startAt);
    await endAtInput.fill(contest.endAt);
    for (const checkbox of languageCheckboxes) {
      await checkbox.check();
    }
    await isAutoJudgeEnabledCheckbox.check();
  }

  async fillProblemForm(problem: Problem) {
    const settingsProblemsTab = this.page.getByTestId("settings-problems-tab");

    const problemItemsBefore = settingsProblemsTab.getByTestId("problem-item");
    const problemItemsBeforeCount = await problemItemsBefore.count();

    const addProblemButton =
      settingsProblemsTab.getByTestId("add-problem-button");
    await addProblemButton.scrollIntoViewIfNeeded();
    await addProblemButton.click();

    const problemItems = settingsProblemsTab.getByTestId("problem-item");
    const problemItemsCount = await problemItems.count();
    expect(problemItemsCount).toBe(problemItemsBeforeCount + 1);

    const lastProblemItem = problemItems.nth(problemItemsCount - 1);
    await lastProblemItem.scrollIntoViewIfNeeded();

    const titleInput = lastProblemItem.getByLabel("Title");
    const timeLimitInput = lastProblemItem.getByLabel("Time Limit (ms)");
    const memoryLimitInput = lastProblemItem.getByLabel("Memory Limit (MB)");
    const descriptionInput = lastProblemItem.getByLabel("Description (PDF)");
    const testCasesInput = lastProblemItem.getByLabel("Test Cases (CSV)");

    await titleInput.fill(problem.title);
    await timeLimitInput.fill(problem.timeLimit.toString());
    await memoryLimitInput.fill(problem.memoryLimit.toString());
    await descriptionInput.setInputFiles(
      FileUtil.loadFile(problem.descriptionFile),
    );
    await testCasesInput.setInputFiles(
      FileUtil.loadFile(problem.testCasesFile),
    );
  }

  async fillMemberForm(member: Member) {
    const settingsMembersTab = this.page.getByTestId("settings-members-tab");
    await settingsMembersTab.scrollIntoViewIfNeeded();

    const memberRowsBefore = settingsMembersTab.getByTestId("member-row");
    const memberRowsBeforeCount = await memberRowsBefore.count();

    const addMemberButton = settingsMembersTab.getByTestId("add-member-button");
    await addMemberButton.scrollIntoViewIfNeeded();
    await addMemberButton.click();

    const memberRows = settingsMembersTab.getByTestId("member-row");
    const memberRowsCount = await memberRows.count();
    expect(memberRowsCount).toBe(memberRowsBeforeCount + 1);

    const lastMemberRow = memberRows.nth(memberRowsCount - 1);
    await lastMemberRow.scrollIntoViewIfNeeded();

    const nameInput = lastMemberRow.getByTestId("member-name");
    const typeSelect = lastMemberRow.getByTestId("member-type");
    const loginInput = lastMemberRow.getByTestId("member-login");
    const passwordInput = lastMemberRow.getByTestId("member-password");

    await nameInput.fill(member.name);
    await typeSelect.selectOption(member.type);
    await loginInput.fill(member.login);
    await passwordInput.fill(member.password);
  }

  async saveSettings() {
    const saveButton = this.page.getByTestId("save-settings-button");
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    await this.confirmDialog();
  }

  async forceStart() {
    const settingsContestTab = this.page.getByTestId("settings-contest-tab");

    const forceStartButton = settingsContestTab.getByTestId(
      "contest-force-start",
    );
    await forceStartButton.scrollIntoViewIfNeeded();
    await forceStartButton.click();
    await this.confirmDialog();
  }

  async forceEnd() {
    const settingsContestTab = this.page.getByTestId("settings-contest-tab");

    const forceEndButton = settingsContestTab.getByTestId("contest-force-end");
    await forceEndButton.scrollIntoViewIfNeeded();
    await forceEndButton.click();
    await this.confirmDialog();
  }
}
