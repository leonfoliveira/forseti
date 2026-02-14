import { expect, Page } from "playwright/test";

import { Actor } from "@/test/actor/actor";
import { Leaderboard } from "@/test/entity/leaderboard";
import { Member } from "@/test/entity/member";

export class ActorOnLeaderboardPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkLeaderboard(leaderboard: Leaderboard) {
    const leaderboardTable = this.page.getByTestId("leaderboard-table");

    const memberRows = leaderboardTable.getByTestId("leaderboard-member-row");
    const memberRowsCount = await memberRows.count();
    expect(memberRowsCount).toBe(leaderboard.members.length);

    for (let i = 0; i < memberRowsCount; i++) {
      const memberRow = memberRows.nth(i);
      const member = leaderboard.members[i];
      await memberRow.scrollIntoViewIfNeeded();

      const rankCell = memberRow.getByTestId("member-rank");
      const nameCell = memberRow.getByTestId("member-name");
      const scoreCell = memberRow.getByTestId("member-score");
      const penaltyCell = memberRow.getByTestId("member-penalty");
      const problemCells = memberRow.getByTestId("member-problem");

      await expect(rankCell).toHaveText(String(i + 1));
      await expect(nameCell).toHaveText(member.name);
      await expect(scoreCell).toHaveText(String(member.score));
      await expect(penaltyCell).not.toBeEmpty();
      const problemCellsCount = await problemCells.count();
      expect(problemCellsCount).toBe(member.problems.length);

      for (let j = 0; j < problemCellsCount; j++) {
        const problemCell = problemCells.nth(j);
        const problem = member.problems[j];

        if (problem.isAccepted && problem.wrongSubmissions === 0) {
          await expect(problemCell).toHaveText(/^\d+$/);
        } else if (problem.isAccepted && problem.wrongSubmissions > 0) {
          await expect(problemCell).toHaveText(/^\d+ \(\+\d+\)$/);
        } else if (!problem.isAccepted && problem.wrongSubmissions > 0) {
          await expect(problemCell).toHaveText(/^\+\d+$/);
        } else {
          await expect(problemCell).toBeEmpty();
        }
      }
    }
  }
}
