import { expect, Page } from "playwright/test";

import { Actor } from "@/test/actor/actor";
import { Clarification } from "@/test/entity/clarification";
import { Member } from "@/test/entity/member";

export class ActorOnClarificationsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkClarifications(clarifications: Clarification[]) {
    const clarificationsList = this.page.getByTestId("clarifications-list");

    const clarificationCards =
      clarificationsList.getByTestId("clarification-card");
    const clarificationCardsCount = await clarificationCards.count();
    expect(clarificationCardsCount).toBe(clarifications.length);

    for (let i = 0; i < clarifications.length; i++) {
      const clarificationCard = clarificationCards.nth(i);
      const clarification = clarifications[i];
      await clarificationCard.scrollIntoViewIfNeeded();

      const memberName = clarificationCard.getByTestId(
        "clarification-member-name",
      );
      const problemTitle = clarificationCard.getByTestId(
        "clarification-problem-title",
      );
      const createdAt = clarificationCard.getByTestId(
        "clarification-created-at",
      );
      const text = clarificationCard.getByTestId("clarification-text");

      await expect(memberName).toHaveText(clarification.member.name);
      await expect(createdAt).not.toBeEmpty();
      if (clarification.problem) {
        await expect(problemTitle).toHaveText(
          `Problem ${clarification.problem.letter}`,
        );
      }
      await expect(text).toHaveText(clarification.text);

      if (clarification.answer) {
        const answerCard = clarificationCard.getByTestId(
          "clarification-answer-card",
        );

        const answerMemberName = answerCard.getByTestId(
          "clarification-answer-member-name",
        );
        const answerCreatedAt = answerCard.getByTestId(
          "clarification-answer-created-at",
        );
        const answerText = answerCard.getByTestId("clarification-answer-text");

        await expect(answerMemberName).toHaveText(
          clarification.answer.member.name,
        );
        await expect(answerCreatedAt).not.toBeEmpty();
        await expect(answerText).toHaveText(clarification.answer.text);
      }
    }
  }

  async createClarification(clarification: Clarification) {
    const clarificationsList = this.page.getByTestId("clarifications-list");

    const clarificationCardsBefore =
      clarificationsList.getByTestId("clarification-card");
    const clarificationCardsCountBefore =
      await clarificationCardsBefore.count();

    const openCreateFormButton = this.page.getByTestId(
      "open-create-form-button",
    );
    await openCreateFormButton.scrollIntoViewIfNeeded();
    await openCreateFormButton.click();

    const clarificationForm = this.page.getByTestId("clarification-form");

    const problemSelect = clarificationForm.getByLabel("Problem");
    const questionInput = clarificationForm.getByLabel("Question");

    if (clarification.problem) {
      await problemSelect.selectOption({
        label: `${clarification.problem.letter}. ${clarification.problem.title}`,
      });
    } else {
      await problemSelect.selectOption("__none__");
    }
    await questionInput.fill(clarification.text);

    const submitButton = clarificationForm.getByTestId(
      "clarification-form-submit",
    );
    await submitButton.click();

    await this.page.waitForFunction((expectedCount) => {
      const cards = document.querySelectorAll(
        '[data-testid="clarification-card"]',
      );
      return cards.length >= expectedCount;
    }, clarificationCardsCountBefore + 1);

    const clarificationCardsAfter =
      clarificationsList.getByTestId("clarification-card");
    const clarificationCardsCountAfter = await clarificationCardsAfter.count();
    expect(clarificationCardsCountAfter).toBe(
      clarificationCardsCountBefore + 1,
    );
    const newClarificationCard = clarificationCardsAfter.first();
    await newClarificationCard.scrollIntoViewIfNeeded();

    const memberName = newClarificationCard.getByTestId(
      "clarification-member-name",
    );
    const problemTitle = newClarificationCard.getByTestId(
      "clarification-problem-title",
    );
    const createdAt = newClarificationCard.getByTestId(
      "clarification-created-at",
    );
    const text = newClarificationCard.getByTestId("clarification-text");

    await expect(memberName).toHaveText(clarification.member.name);
    await expect(createdAt).not.toBeEmpty();
    if (clarification.problem) {
      await expect(problemTitle).toHaveText(
        `Problem ${clarification.problem.letter}`,
      );
    }
    await expect(text).toHaveText(clarification.text);
  }

  async answerClarification(index: number) {
    const clarificationsList = this.page.getByTestId("clarifications-list");
    const clarificationCard = clarificationsList
      .getByTestId("clarification-card")
      .nth(index);

    const textArea = clarificationCard.getByLabel("Answer");
    await textArea.fill("This is an answer.");

    const answerButton = clarificationCard.getByTestId(
      "clarification-answer-submit-button",
    );
    await answerButton.click();

    const answerCard = clarificationCard.getByTestId(
      "clarification-answer-card",
    );

    const answerMemberName = answerCard.getByTestId(
      "clarification-answer-member-name",
    );
    const answerCreatedAt = answerCard.getByTestId(
      "clarification-answer-created-at",
    );
    const answerText = answerCard.getByTestId("clarification-answer-text");

    await expect(answerMemberName).toHaveText(this.member.name);
    await expect(answerCreatedAt).not.toBeEmpty();
    await expect(answerText).toHaveText("This is an answer.");
  }

  async deleteClarification(index: number) {
    const clarificationsList = this.page.getByTestId("clarifications-list");
    const clarificationCardsBefore =
      clarificationsList.getByTestId("clarification-card");
    const clarificationCardsCountBefore =
      await clarificationCardsBefore.count();
    const clarificationCard = clarificationCardsBefore.nth(index);

    const deleteButton = clarificationCard.getByTestId(
      "clarification-delete-button",
    );
    await deleteButton.click();
    await this.confirmDialog();

    const clarificationCardsAfter =
      clarificationsList.getByTestId("clarification-card");
    const clarificationCardsCountAfter = await clarificationCardsAfter.count();
    expect(clarificationCardsCountAfter).toBe(
      clarificationCardsCountBefore - 1,
    );
  }
}
