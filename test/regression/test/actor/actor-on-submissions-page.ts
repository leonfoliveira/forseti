import { expect, Page } from "playwright/types/test";

import { Actor } from "@/test/actor/actor";
import { Member } from "@/test/entity/member";
import { Submission, SubmissionAnswer } from "@/test/entity/submission";
import { FileUtil } from "@/test/util/file-util";

export class ActorOnSubmissionsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkSubmissions(submissions: Submission[]) {
    const submissionsTable = this.page.getByTestId("submissions-table");

    const submissionRows = submissionsTable.getByTestId("submission-row");
    const submissionRowsCount = await submissionRows.count();
    expect(submissionRowsCount).toBe(submissions.length);

    for (let i = 0; i < submissionRowsCount; i++) {
      const submissionRow = submissionRows.nth(i);
      const submission = submissions[i];
      await submissionRow.scrollIntoViewIfNeeded();

      const timestampCell = submissionRow.getByTestId("submission-timestamp");
      const memberCell = submissionRow.getByTestId("submission-member");
      const problemCell = submissionRow.getByTestId("submission-problem");
      const languageCell = submissionRow.getByTestId("submission-language");
      const answerCell = submissionRow.getByTestId("submission-answer");

      await expect(timestampCell).not.toBeEmpty();
      await expect(memberCell).toHaveText(submission.member.name);
      await expect(problemCell).toHaveText(submission.problem.letter);
      await expect(languageCell).toHaveText(submission.language);
      await expect(answerCell).toHaveText(submission.answer);
    }
  }

  async downloadSubmission(index: number) {
    const submissionsTable = this.page.getByTestId("submissions-table");

    const submissionRows = submissionsTable.getByTestId("submission-row");
    const submissionRow = submissionRows.nth(index);
    await submissionRow.scrollIntoViewIfNeeded();

    const actionsButton = submissionRow.getByTestId(
      "submission-actions-button",
    );
    await actionsButton.click();

    const downloadActionButton = this.page.getByTestId(
      "submissions-page-action-download",
    );
    const downloadPromise = this.page.waitForEvent("download");
    await downloadActionButton.click();
    const download = await downloadPromise;
    expect(await download.path()).toBeTruthy();
  }

  async rerunSubmission(index: number, answer: SubmissionAnswer) {
    const submissionsTable = this.page.getByTestId("submissions-table");

    const submissionRows = submissionsTable.getByTestId("submission-row");
    const submissionRow = submissionRows.nth(index);
    await submissionRow.scrollIntoViewIfNeeded();

    const actionsButton = submissionRow.getByTestId(
      "submission-actions-button",
    );
    await actionsButton.click();

    const rerunActionButton = this.page.getByTestId(
      "submissions-page-action-rerun",
    );
    await rerunActionButton.click();
    await this.confirmDialog();

    const answerCell = submissionRow.getByTestId("submission-answer");
    await expect(answerCell).toHaveText(answer);
  }

  async judgeSubmission(index: number, answer: SubmissionAnswer) {
    const submissionsTable = this.page.getByTestId("submissions-table");
    const submissionRows = submissionsTable.getByTestId("submission-row");
    const submissionRow = submissionRows.nth(index);
    await submissionRow.scrollIntoViewIfNeeded();

    const actionsButton = submissionRow.getByTestId(
      "submission-actions-button",
    );
    await actionsButton.click();

    const judgeActionButton = this.page.getByTestId(
      "submissions-page-action-judge",
    );
    await judgeActionButton.click();

    const formAnswer = this.page.getByTestId("submission-judge-form-answer");
    await formAnswer.selectOption(answer);
    await this.confirmDialog();

    const answerCell = submissionRow.getByTestId("submission-answer");
    await expect(answerCell).toHaveText(answer);
  }

  async createSubmission(submission: Submission) {
    const submissionsTable = this.page.getByTestId("submissions-table");
    const submissionRowsBefore = submissionsTable.getByTestId("submission-row");
    const submissionRowsCountBefore = await submissionRowsBefore.count();

    const createSubmissionButton = this.page.getByTestId(
      "open-create-form-button",
    );
    await createSubmissionButton.scrollIntoViewIfNeeded();
    await createSubmissionButton.click();

    const submissionForm = this.page.getByTestId("submission-form");

    const problemSelect = submissionForm.getByTestId("submission-form-problem");
    const languageSelect = submissionForm.getByTestId(
      "submission-form-language",
    );
    const codeInput = submissionForm.getByTestId("submission-form-code");

    await problemSelect.selectOption({
      label: `${submission.problem.letter}. ${submission.problem.title}`,
    });
    await languageSelect.selectOption(submission.language);
    await codeInput.setInputFiles(FileUtil.loadFile(submission.code));

    const submitButton = submissionForm.getByTestId("submission-form-submit");
    await submitButton.click();

    await this.page.waitForFunction((expectedCount) => {
      const rows = document.querySelectorAll('[data-testid="submission-row"]');
      return rows.length >= expectedCount;
    }, submissionRowsCountBefore + 1);

    const submissionRowsAfter = submissionsTable.getByTestId("submission-row");
    const submissionRowsCountAfter = await submissionRowsAfter.count();
    expect(submissionRowsCountAfter).toBe(submissionRowsCountBefore + 1);

    const newSubmissionRow = submissionRowsAfter.first();
    await newSubmissionRow.scrollIntoViewIfNeeded();

    const memberCell = newSubmissionRow.getByTestId("submission-member");
    const problemCell = newSubmissionRow.getByTestId("submission-problem");
    const languageCell = newSubmissionRow.getByTestId("submission-language");
    const answerCell = newSubmissionRow.getByTestId("submission-answer");

    await expect(memberCell).toHaveText(submission.member.name);
    await expect(problemCell).toHaveText(submission.problem.letter);
    await expect(languageCell).toHaveText(submission.language);
    await expect(answerCell).toHaveText(submission.answer);
  }
}
