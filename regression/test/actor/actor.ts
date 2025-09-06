import { expect, Page } from "@playwright/test";

import { Member } from "@/test/entity/member";

export class Actor {
  constructor(
    protected readonly page: Page,
    protected readonly slug: string,
    public readonly member: Member,
  ) {}

  async navigate(tag: string) {
    const dashboardNav = this.page.getByTestId("dashboard-nav");
    await dashboardNav.getByRole("tab", { name: tag }).click();
  }

  async signIn() {
    await this.page.goto(`/${this.slug}/sign-in`);

    await this.page.getByLabel("Login").fill(this.member.login);
    await this.page.getByLabel("Password").fill(this.member.password);
    await this.page.getByRole("button", { name: "Sign in" }).click();

    await expect(this.page).toHaveURL(`/${this.slug}/leaderboard`);
  }

  async signOut() {
    const header = this.page.getByTestId("header");
    await header.getByRole("button", { name: this.member.name }).click();
    const signOutItem = this.page.getByText("Sign Out").last();
    await expect(signOutItem).toBeVisible();
    await signOutItem.click();
    await expect(this.page).toHaveURL(`/${this.slug}/sign-in`);
  }
}
