import { expect, Page } from "playwright/types/test";

import { Actor } from "@/test/actor/actor";
import { LeaderboardMember } from "@/test/entity/leaderboard";
import { Member } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";

export class ActorOnProblemsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkProblems(problems: Problem[]) {
    const problemsTable = this.page.getByTestId("problems-table");

    const problemRows = problemsTable.getByTestId("problem-row");
    const problemRowsCount = await problemRows.count();
    expect(problemRowsCount).toBe(problems.length);

    for (let i = 0; i < problemRowsCount; i++) {
      const problemRow = problemRows.nth(i);
      const problem = problems[i];
      await problemRow.scrollIntoViewIfNeeded();

      const letterCell = problemRow.getByTestId("problem-letter");
      const titleCell = problemRow.getByTestId("problem-title");
      const timeLimitCell = problemRow.getByTestId("problem-time-limit");
      const memoryLimitCell = problemRow.getByTestId("problem-memory-limit");

      await expect(letterCell).toHaveText(problem.letter);
      await expect(titleCell).toHaveText(problem.title);
      await expect(timeLimitCell).toHaveText(`${problem.timeLimit / 1000}s`);
      await expect(memoryLimitCell).toHaveText(`${problem.memoryLimit} MB`);

      const downloadActionButton = problemRow.getByTestId("problem-download");
      const downloadPromise = this.page.waitForEvent("download");
      await downloadActionButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain(".pdf");
      expect(await download.path()).toBeTruthy();
    }
  }

  async checkProblemsStatus(
    problems: Problem[],
    leaderboardMember: LeaderboardMember,
  ) {
    const problemsTable = this.page.getByTestId("problems-table");

    const problemRows = problemsTable.getByTestId("problem-row");
    const problemRowsCount = await problemRows.count();
    expect(problemRowsCount).toBe(problems.length);

    for (let i = 0; i < problemRowsCount; i++) {
      const problemRow = problemRows.nth(i);
      const problemStatus = leaderboardMember.problems[i];
      await problemRow.scrollIntoViewIfNeeded();

      const statusCell = problemRow.getByTestId("problem-status");
      if (problemStatus.isAccepted) {
        await expect(statusCell).toHaveText("Accepted");
      } else if (problemStatus.wrongSubmissions > 0) {
        await expect(statusCell).toHaveText(
          `${problemStatus.wrongSubmissions} Attempts`,
        );
      } else {
        await expect(statusCell).toHaveText("Not Attempted");
      }
    }
  }
}
