import { routes } from "@/config/routes";

describe("routes", () => {
  it("should map routes", () => {
    const slug = "test-slug";
    const contestId = "12345";

    expect(routes.HOME).toBe("/");
    expect(routes.FORBIDDEN).toBe("/forbidden");
    expect(routes.NOT_FOUND).toBe("/not-found");
    expect(routes.ROOT).toBe("/root");
    expect(routes.ROOT_CONTESTS).toBe("/root/contests");
    expect(routes.ROOT_CONTESTS_NEW).toBe("/root/contests/new");
    expect(routes.ROOT_CONTESTS_EDIT(contestId)).toBe(
      `/root/contests/${contestId}`,
    );
    expect(routes.ROOT_SIGN_IN()).toBe("/root/sign-in");
    expect(routes.ROOT_SIGN_IN(true)).toBe("/root/sign-in?signOut=true");
    expect(routes.CONTEST_SIGN_IN(slug)).toBe(`/contests/${slug}/sign-in`);
    expect(routes.CONTEST_SIGN_IN(slug, true)).toBe(
      `/contests/${slug}/sign-in?signOut=true`,
    );
    expect(routes.CONTEST(slug)).toBe(`/contests/${slug}`);
    expect(routes.CONTEST_CONTESTANT(slug)).toBe(
      `/contests/${slug}/contestant`,
    );
    expect(routes.CONTEST_CONTESTANT_LEADERBOARD(slug)).toBe(
      `/contests/${slug}/contestant/leaderboard`,
    );
    expect(routes.CONTEST_CONTESTANT_PROBLEMS(slug)).toBe(
      `/contests/${slug}/contestant/problems`,
    );
    expect(routes.CONTEST_CONTESTANT_SUBMISSIONS(slug)).toBe(
      `/contests/${slug}/contestant/submissions`,
    );
    expect(routes.CONTEST_CONTESTANT_TIMELINE(slug)).toBe(
      `/contests/${slug}/contestant/timeline`,
    );
    expect(routes.CONTEST_CONTESTANT_CLARIFICATIONS(slug)).toBe(
      `/contests/${slug}/contestant/clarifications`,
    );
    expect(routes.CONTEST_CONTESTANT_ANNOUNCEMENTS(slug)).toBe(
      `/contests/${slug}/contestant/announcements`,
    );
    expect(routes.CONTEST_JURY(slug)).toBe(`/contests/${slug}/jury`);
    expect(routes.CONTEST_JURY_LEADERBOARD(slug)).toBe(
      `/contests/${slug}/jury/leaderboard`,
    );
    expect(routes.CONTEST_JURY_PROBLEMS(slug)).toBe(
      `/contests/${slug}/jury/problems`,
    );
    expect(routes.CONTEST_JURY_SUBMISSIONS(slug)).toBe(
      `/contests/${slug}/jury/submissions`,
    );
    expect(routes.CONTEST_JURY_CLARIFICATIONS(slug)).toBe(
      `/contests/${slug}/jury/clarifications`,
    );
    expect(routes.CONTEST_JURY_ANNOUNCEMENTS(slug)).toBe(
      `/contests/${slug}/jury/announcements`,
    );
    expect(routes.CONTEST_GUEST(slug)).toBe(`/contests/${slug}/guest`);
    expect(routes.CONTEST_GUEST_LEADERBOARD(slug)).toBe(
      `/contests/${slug}/guest/leaderboard`,
    );
    expect(routes.CONTEST_GUEST_PROBLEMS(slug)).toBe(
      `/contests/${slug}/guest/problems`,
    );
    expect(routes.CONTEST_GUEST_TIMELINE(slug)).toBe(
      `/contests/${slug}/guest/timeline`,
    );
    expect(routes.CONTEST_GUEST_CLARIFICATIONS(slug)).toBe(
      `/contests/${slug}/guest/clarifications`,
    );
    expect(routes.CONTEST_GUEST_ANNOUNCEMENTS(slug)).toBe(
      `/contests/${slug}/guest/announcements`,
    );
  });
});
