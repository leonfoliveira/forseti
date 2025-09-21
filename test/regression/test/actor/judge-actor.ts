import { expect, Page } from "@playwright/test";

import { Actor } from "@/test/actor/actor";
import { Member } from "@/test/entity/member";
import { Submission } from "@/test/entity/submission";

export class JudgeActor extends Actor {
  constructor(page: Page, slug: string, member: Member) {
    super(page, slug, member);
  }

  async checkoutSubmissions(submissions: Submission[]) {
    const submissionRows = this.page.getByTestId("submission");
    await expect(submissionRows).toHaveCount(submissions.length);
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      const row = submissionRows.nth(i);
      await expect(row.getByTestId("submission-problem-letter")).toHaveText(
        submission.problem.letter,
      );
      await expect(row.getByTestId("submission-language")).toHaveText(
        submission.language,
      );
      await expect(row.getByTestId("submission-answer")).toHaveText(
        submission.answer,
      );
    }
  }

  async judgeSubmission(index: number, answer: string) {
    const row = this.page.getByTestId("submission").nth(index);
    await row.getByTestId("submission-judge").click();
    await this.page.getByLabel("Answer").selectOption({ label: answer });
    await this.page.getByRole("button", { name: "Confirm" }).click();
    await expect(row.getByTestId("submission-answer")).toHaveText(answer);
  }

  async answerClarification(index: number, answer: string) {
    const row = this.page.getByTestId("clarification").nth(index);
    await this.page.getByTestId("answer-form-text").fill(answer);
    await row.getByRole("button", { name: "Answer" }).click();
    await expect(row.getByTestId("answer-text")).toHaveText(answer);
  }

  async createAnnouncement(text: string) {
    this.page.getByLabel("Text").fill(text);
    await this.page.getByRole("button", { name: "Submit" }).click();
    await expect(this.page.getByTestId("announcement-text").first()).toHaveText(
      text,
    );
  }
}
