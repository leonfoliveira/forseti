import { expect, Page } from "playwright/types/test";

import { Actor } from "@/test/actor/actor";
import { Announcement } from "@/test/entity/announcement";
import { Member } from "@/test/entity/member";

export class ActorOnAnnouncementsPage extends Actor {
  constructor(page: Page, member: Member) {
    super(page, member);
  }

  async checkAnnouncements(announcements: Announcement[]) {
    const announcementsList = this.page.getByTestId("announcements-list");

    const announcementCards =
      announcementsList.getByTestId("announcement-card");
    const announcementCardsCount = await announcementCards.count();
    expect(announcementCardsCount).toBe(announcements.length);

    for (let i = 0; i < announcements.length; i++) {
      const announcementCard = announcementCards.nth(i);
      const announcement = announcements[i];
      await announcementCard.scrollIntoViewIfNeeded();

      const memberName = announcementCard.getByTestId(
        "announcement-member-name",
      );
      const createdAt = announcementCard.getByTestId("announcement-created-at");
      const text = announcementCard.getByTestId("announcement-text");

      await expect(memberName).toHaveText(announcement.member.name);
      await expect(createdAt).not.toBeEmpty();
      await expect(text).toHaveText(announcement.text);
    }
  }

  async createAnnouncement(announcement: Announcement) {
    const announcementsCardBefore = this.page.getByTestId("announcements-card");
    const announcementsCardBeforeCount = await announcementsCardBefore.count();

    const openCreateFormButton = this.page.getByTestId(
      "open-create-form-button",
    );
    await openCreateFormButton.scrollIntoViewIfNeeded();
    await openCreateFormButton.click();

    const announcementForm = this.page.getByTestId("announcement-form");

    const textInput = announcementForm.getByLabel("Message");

    await textInput.fill(announcement.text);

    const broadcastButton = announcementForm.getByTestId(
      "announcement-form-submit",
    );
    await broadcastButton.click();

    await this.page.waitForFunction((expectedCount) => {
      const cards = document.querySelectorAll(
        '[data-testid="announcement-card"]',
      );
      return cards.length >= expectedCount;
    }, announcementsCardBeforeCount + 1);

    const announcementsCardAfter = this.page.getByTestId("announcement-card");
    const announcementsCardAfterCount = await announcementsCardAfter.count();
    expect(announcementsCardAfterCount).toBe(announcementsCardBeforeCount + 1);

    const newAnnouncementCard = announcementsCardAfter.first();
    await newAnnouncementCard.scrollIntoViewIfNeeded();

    const memberName = newAnnouncementCard.getByTestId(
      "announcement-member-name",
    );
    const createdAt = newAnnouncementCard.getByTestId(
      "announcement-created-at",
    );
    const text = newAnnouncementCard.getByTestId("announcement-text");

    await expect(memberName).toHaveText(announcement.member.name);
    await expect(createdAt).not.toBeEmpty();
    await expect(text).toHaveText(announcement.text);
  }
}
