import { expect, Page } from "@playwright/test";

import { ActorOnAnnouncementsPage } from "@/test/actor/actor-on-announcements-page";
import { ActorOnClarificationsPage } from "@/test/actor/actor-on-clarifications-page";
import { ActorOnLeaderboardPage } from "@/test/actor/actor-on-leaderboard-page";
import { ActorOnProblemsPage } from "@/test/actor/actor-on-problems-page";
import { ActorOnSettingsPage } from "@/test/actor/actor-on-settings-page";
import { ActorOnSubmissionsPage } from "@/test/actor/actor-on-submissions-page";
import { config } from "@/test/config";
import { Contest, ContestStatus } from "@/test/entity/contest";
import { Member } from "@/test/entity/member";
import { CLIAdapter } from "@/test/util/cli-adapter";

export class Actor {
  constructor(
    protected readonly page: Page,
    public readonly member: Member,
  ) {}

  async createContest(contest: Contest): Promise<string> {
    return await CLIAdapter.run([
      "contest",
      "create",
      contest.slug,
      "--api-url",
      config.API_URL,
    ]);
  }

  async signIn(contest: Contest) {
    await this.page.goto(`/${contest.slug}/sign-in`);

    const signInForm = this.page.getByTestId("sign-in-form");
    await signInForm.scrollIntoViewIfNeeded();

    const loginInput = signInForm.getByLabel("Login");
    const passwordInput = signInForm.getByLabel("Password");
    const signInButton = signInForm.getByTestId("sign-in");
    const enterGuestButton = signInForm.getByTestId("enter-guest");

    await loginInput.fill(this.member.login);
    await passwordInput.fill(this.member.password);
    await expect(enterGuestButton).toBeEnabled();

    await signInButton.click();
    await expect(this.page).toHaveURL(`/${contest.slug}/leaderboard`);
  }

  async signOut(contest: Contest) {
    const header = this.page.getByTestId("header");
    await header.scrollIntoViewIfNeeded();

    const signOutButton = header.getByTestId("sign-out").last();
    await expect(signOutButton).toBeVisible();
    await signOutButton.click();

    await expect(this.page).toHaveURL(`/${contest.slug}/sign-in`);
  }

  async navigateToLeaderboard(
    contest: Contest,
  ): Promise<ActorOnLeaderboardPage> {
    await this.navigate(contest, "leaderboard");
    return new ActorOnLeaderboardPage(this.page, this.member);
  }

  async navigateToProblems(contest: Contest): Promise<ActorOnProblemsPage> {
    await this.navigate(contest, "problems");
    return new ActorOnProblemsPage(this.page, this.member);
  }

  async navigateToSubmissions(
    contest: Contest,
  ): Promise<ActorOnSubmissionsPage> {
    await this.navigate(contest, "submissions");
    return new ActorOnSubmissionsPage(this.page, this.member);
  }

  async navigateToClarifications(
    contest: Contest,
  ): Promise<ActorOnClarificationsPage> {
    await this.navigate(contest, "clarifications");
    return new ActorOnClarificationsPage(this.page, this.member);
  }

  async navigateToAnnouncements(
    contest: Contest,
  ): Promise<ActorOnAnnouncementsPage> {
    await this.navigate(contest, "announcements");
    return new ActorOnAnnouncementsPage(this.page, this.member);
  }

  async navigateToSettings(contest: Contest): Promise<ActorOnSettingsPage> {
    await this.navigate(contest, "settings");
    return new ActorOnSettingsPage(this.page, this.member);
  }

  private async navigate(contest: Contest, tab: string) {
    const dashboardPage = this.page.getByTestId("dashboard-tabs");
    const tabButton = dashboardPage.getByTestId(`tab-/${contest.slug}/${tab}`);
    await tabButton.scrollIntoViewIfNeeded();

    await tabButton.click();
    await expect(this.page).toHaveURL(`/${contest.slug}/${tab}`);
  }

  async checkWaitPage(contest: Contest) {
    const waitPage = this.page.getByTestId("wait-page");

    const title = waitPage.getByTestId("title");
    const clock = waitPage.getByTestId("clock");
    const languageItems = waitPage.getByTestId("language-item");

    await expect(title).toHaveText(contest.title);
    await expect(clock).toBeVisible();
    for (let i = 0; i < contest.languages.length; i++) {
      const languageItem = languageItems.nth(i);
      const language = contest.languages[i];
      await expect(languageItem).toHaveText(language);
    }
  }

  async checkHeader(contest: Contest) {
    const header = this.page.getByTestId("header");
    await header.scrollIntoViewIfNeeded();

    const title = header.getByTestId("title");
    const status = header.getByTestId("status");
    const countdown = header.getByTestId("countdown-clock");
    const themeToggle = header.getByTestId("theme-toggle").last();
    const memberName = header.getByTestId("member-name").last();
    const memberType = header.getByTestId("member-type").last();
    const signOutButton = header.getByTestId("sign-out").last();

    await expect(countdown).toBeVisible({
      visible: contest.status !== ContestStatus.ENDED,
    });
    await expect(themeToggle).toBeVisible();
    await expect(signOutButton).toBeVisible({
      visible: !this.page.url().includes("/sign-in"),
    });

    await expect(title).toHaveText(contest.title);
    await expect(status).toHaveText(contest.status);
    await expect(memberName).toHaveText(this.member.name);
    await expect(memberType).toHaveText(this.member.type);
  }

  async toggleTheme() {
    const header = this.page.getByTestId("header");

    const themeToggle = header.getByTestId("theme-toggle").last();

    const currentTheme = await this.page.evaluate(
      () => document.documentElement.className,
    );
    await themeToggle.click();
    await expect(this.page.locator("html")).toContainClass(
      currentTheme === "dark" ? "light" : "dark",
    );
  }

  async confirmDialog() {
    const confirmButton = this.page.getByTestId(
      "confirmation-dialog-confirm-button",
    );
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await expect(confirmButton).not.toBeVisible();
  }
}
