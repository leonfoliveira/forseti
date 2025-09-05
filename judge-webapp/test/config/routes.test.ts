import { routes } from "@/config/routes";

describe("routes", () => {
  it("should map routes", () => {
    const slug = "test-slug";

    expect(routes.CONTEST(slug)).toBe(`/${slug}`);
    expect(routes.CONTEST_SIGN_IN(slug)).toBe(`/${slug}/sign-in`);
    expect(routes.CONTEST_LEADERBOARD(slug)).toBe(`/${slug}/leaderboard`);
    expect(routes.CONTEST_PROBLEMS(slug)).toBe(`/${slug}/problems`);
    expect(routes.CONTEST_SUBMISSIONS(slug)).toBe(`/${slug}/submissions`);
    expect(routes.CONTEST_CLARIFICATIONS(slug)).toBe(`/${slug}/clarifications`);
    expect(routes.CONTEST_ANNOUNCEMENTS(slug)).toBe(`/${slug}/announcements`);
    expect(routes.CONTEST_SETTINGS(slug)).toBe(`/${slug}/settings`);
  });
});
