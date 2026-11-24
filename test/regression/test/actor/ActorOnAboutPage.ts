import { expect, Page } from "@playwright/test";

import { Actor } from "@/test/actor/Actor";
import { Contest } from "@/test/entity/Contest";
import { Member } from "@/test/entity/Member";

export class ActorOnAboutPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkAbout(contest: Contest) {
    const about = this.page.getByTestId("about");
    await about.scrollIntoViewIfNeeded();

    const contestTitle = about.getByTestId("title");
    await expect(contestTitle).toHaveText(contest.title);

    for (const language of contest.languages) {
      const languageBadge = about.getByText(language);
      await expect(languageBadge).toBeVisible();
    }

    const autoJudgeEnabled = about.getByTestId("auto-judge-enabled");
    const clarificationEnabled = about.getByTestId("clarification-enabled");
    const submissionPrintTicketEnabled = about.getByTestId(
      "submission-print-ticket-enabled",
    );
    const spectatorEnabled = about.getByTestId("spectator-enabled");

    await expect(autoJudgeEnabled).toBeVisible();
    await expect(clarificationEnabled).toBeVisible();
    await expect(submissionPrintTicketEnabled).toBeVisible();
    await expect(spectatorEnabled).toBeVisible();
  }
}
