import { expect, Page } from "@playwright/test";

import { Actor } from "@/test/actor/actor";
import { Member } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";
import { Submission } from "@/test/entity/submission";
import { FileUtil } from "@/test/util/file-util";

export class ContestantActor extends Actor {
  constructor(page: Page, slug: string, member: Member) {
    super(page, slug, member);
  }

  async checkoutLeaderboard(score: number) {
    await expect(this.page.getByTestId("member-score")).toHaveText(
      String(score),
    );
  }

  async checkProblems(problems: Problem[]) {
    const problemRows = this.page.getByTestId("problem");
    await expect(problemRows).toHaveCount(problems.length);

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const row = problemRows.nth(i);
      await expect(row.getByTestId("problem-letter")).toHaveText(
        problem.letter,
      );
      await expect(row.getByTestId("problem-title")).toHaveText(problem.title);
    }
  }

  async createSubmission(submission: Submission) {
    const previousSubmissionCount = await this.page
      .getByTestId("submission")
      .count();

    const createForm = this.page.getByTestId("create-form");
    await createForm.getByLabel("Problem").selectOption({
      label: `${submission.problem.letter}. ${submission.problem.title}`,
    });
    await createForm
      .getByLabel("Language")
      .selectOption({ label: submission.language });
    await createForm
      .getByLabel("Code")
      .setInputFiles(FileUtil.loadFile(submission.code));
    await createForm.getByRole("button", { name: "Submit" }).click();

    await expect(this.page.getByTestId("submission")).toHaveCount(
      previousSubmissionCount + 1,
    );
    await expect(this.page.getByTestId("submission-answer").first()).toHaveText(
      submission.answer,
    );
  }

  async createClarification(problem: Problem, text: string) {
    await this.page
      .getByLabel("Problem (optional)")
      .selectOption({ label: problem.toOption() });
    await this.page.getByLabel("Text").fill(text);
    await this.page.getByRole("button", { name: "Submit" }).click();
    await expect(
      this.page.getByTestId("clarification-text").first(),
    ).toHaveText(text);
  }
}
