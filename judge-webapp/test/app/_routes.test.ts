import { routes } from "@/app/_routes";

describe("_routes", () => {
  it("should have all routes defined", () => {
    const contestId = "123";
    const contestSlug = "test-contest";

    expect(routes.HOME).toEqual("/");
    expect(routes.NOT_FOUND).toEqual("/not-found");
    expect(routes.FORBIDDEN).toEqual("/forbidden");
    expect(routes.ROOT).toEqual("/root");
    expect(routes.ROOT_CONTESTS).toEqual("/root/contests");
    expect(routes.ROOT_CONTESTS_NEW).toEqual("/root/contests/new");
    expect(routes.ROOT_CONTESTS_EDIT(contestId)).toEqual(
      `/root/contests/${contestId}`,
    );
    expect(routes.ROOT_SIGN_IN()).toEqual("/root/sign-in");
    expect(routes.ROOT_SIGN_IN(true)).toEqual("/root/sign-in?signOut=true");
    expect(routes.CONTEST_SIGN_IN(contestSlug)).toEqual(
      `/contests/${contestSlug}/sign-in`,
    );
    expect(routes.CONTEST_SIGN_IN(contestSlug, true)).toEqual(
      `/contests/${contestSlug}/sign-in?signOut=true`,
    );
    expect(routes.CONTEST(contestSlug)).toEqual(`/contests/${contestSlug}`);
    expect(routes.CONTEST_CONTESTANT(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant`,
    );
    expect(routes.CONTEST_CONTESTANT_LEADERBOARD(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant/leaderboard`,
    );
    expect(routes.CONTEST_CONTESTANT_PROBLEMS(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant/problems`,
    );
    expect(routes.CONTEST_CONTESTANT_SUBMISSIONS(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant/submissions`,
    );
    expect(routes.CONTEST_CONTESTANT_TIMELINE(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant/timeline`,
    );
    expect(routes.CONTEST_CONTESTANT_CLARIFICATIONS(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant/clarifications`,
    );
    expect(routes.CONTEST_CONTESTANT_ANNOUNCEMENTS(contestSlug)).toEqual(
      `/contests/${contestSlug}/contestant/announcements`,
    );
    expect(routes.CONTEST_JURY(contestSlug)).toEqual(
      `/contests/${contestSlug}/jury`,
    );
    expect(routes.CONTEST_JURY_LEADERBOARD(contestSlug)).toEqual(
      `/contests/${contestSlug}/jury/leaderboard`,
    );
    expect(routes.CONTEST_JURY_PROBLEMS(contestSlug)).toEqual(
      `/contests/${contestSlug}/jury/problems`,
    );
    expect(routes.CONTEST_JURY_SUBMISSIONS(contestSlug)).toEqual(
      `/contests/${contestSlug}/jury/submissions`,
    );
    expect(routes.CONTEST_JURY_CLARIFICATIONS(contestSlug)).toEqual(
      `/contests/${contestSlug}/jury/clarifications`,
    );
    expect(routes.CONTEST_JURY_ANNOUNCEMENTS(contestSlug)).toEqual(
      `/contests/${contestSlug}/jury/announcements`,
    );
    expect(routes.CONTEST_GUEST(contestSlug)).toEqual(
      `/contests/${contestSlug}/guest`,
    );
    expect(routes.CONTEST_GUEST_LEADERBOARD(contestSlug)).toEqual(
      `/contests/${contestSlug}/guest/leaderboard`,
    );
    expect(routes.CONTEST_GUEST_PROBLEMS(contestSlug)).toEqual(
      `/contests/${contestSlug}/guest/problems`,
    );
    expect(routes.CONTEST_GUEST_TIMELINE(contestSlug)).toEqual(
      `/contests/${contestSlug}/guest/timeline`,
    );
    expect(routes.CONTEST_GUEST_CLARIFICATIONS(contestSlug)).toEqual(
      `/contests/${contestSlug}/guest/clarifications`,
    );
    expect(routes.CONTEST_GUEST_ANNOUNCEMENTS(contestSlug)).toEqual(
      `/contests/${contestSlug}/guest/announcements`,
    );
  });
});
