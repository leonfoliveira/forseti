function build(
  path: string,
  params: Record<string, string | number | boolean> = {},
  query: Record<string, string | number | boolean | undefined> = {},
): string {
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`{${key}}`, String(value));
  });

  const treatedQuery: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      treatedQuery[key] = String(value);
    }
  });
  const queryString = new URLSearchParams(treatedQuery).toString();
  return queryString ? `${path}?${queryString}` : path;
}

const paths = {
  HOME: "/",
  NOT_FOUND: "/not-found",
  FORBIDDEN: "/forbidden",
  ROOT: "/root",
  ROOT_CONTESTS: "/root/contests",
  ROOT_CONTESTS_NEW: "/root/contests/new",
  ROOT_CONTESTS_EDIT: `/root/contests/{id}`,
  ROOT_SIGN_IN: `/root/sign-in`,
  CONTEST_SIGN_IN: `/contests/{slug}/sign-in`,
  CONTEST: `/contests/{slug}`,
  CONTEST_CONTESTANT: `/contests/{slug}/contestant`,
  CONTEST_CONTESTANT_LEADERBOARD: `/contests/{slug}/contestant/leaderboard`,
  CONTEST_CONTESTANT_PROBLEMS: `/contests/{slug}/contestant/problems`,
  CONTEST_CONTESTANT_SUBMISSIONS: `/contests/{slug}/contestant/submissions`,
  CONTEST_CONTESTANT_TIMELINE: `/contests/{slug}/contestant/timeline`,
  CONTEST_CONTESTANT_CLARIFICATIONS: `/contests/{slug}/contestant/clarifications`,
  CONTEST_CONTESTANT_ANNOUNCEMENTS: `/contests/{slug}/contestant/announcements`,
  CONTEST_JURY: `/contests/{slug}/jury`,
  CONTEST_JURY_LEADERBOARD: `/contests/{slug}/jury/leaderboard`,
  CONTEST_JURY_PROBLEMS: `/contests/{slug}/jury/problems`,
  CONTEST_JURY_SUBMISSIONS: `/contests/{slug}/jury/submissions`,
  CONTEST_JURY_CLARIFICATIONS: `/contests/{slug}/jury/clarifications`,
  CONTEST_JURY_ANNOUNCEMENTS: `/contests/{slug}/jury/announcements`,
  CONTEST_GUEST: `/contests/{slug}/guest`,
  CONTEST_GUEST_LEADERBOARD: `/contests/{slug}/guest/leaderboard`,
  CONTEST_GUEST_PROBLEMS: `/contests/{slug}/guest/problems`,
  CONTEST_GUEST_TIMELINE: `/contests/{slug}/guest/timeline`,
  CONTEST_GUEST_CLARIFICATIONS: `/contests/{slug}/guest/clarifications`,
  CONTEST_GUEST_ANNOUNCEMENTS: `/contests/{slug}/guest/announcements`,
};

function withSlug(path: string) {
  return (slug: string) => build(path, { slug });
}

export const routes = {
  HOME: build(paths.HOME),
  FORBIDDEN: build(paths.FORBIDDEN),
  NOT_FOUND: build(paths.NOT_FOUND),
  ROOT: build(paths.ROOT),
  ROOT_CONTESTS: build(paths.ROOT_CONTESTS),
  ROOT_CONTESTS_NEW: build(paths.ROOT_CONTESTS_NEW),
  ROOT_CONTESTS_EDIT: (id: string) => build(paths.ROOT_CONTESTS_EDIT, { id }),
  ROOT_SIGN_IN: (signOut?: boolean) =>
    build(paths.ROOT_SIGN_IN, {}, { signOut }),
  CONTEST_SIGN_IN: (slug: string, signOut?: boolean) =>
    build(paths.CONTEST_SIGN_IN, { slug }, { signOut }),
  CONTEST: withSlug(paths.CONTEST),
  CONTEST_CONTESTANT: withSlug(paths.CONTEST_CONTESTANT),
  CONTEST_CONTESTANT_LEADERBOARD: withSlug(
    paths.CONTEST_CONTESTANT_LEADERBOARD,
  ),
  CONTEST_CONTESTANT_PROBLEMS: withSlug(paths.CONTEST_CONTESTANT_PROBLEMS),
  CONTEST_CONTESTANT_SUBMISSIONS: withSlug(
    paths.CONTEST_CONTESTANT_SUBMISSIONS,
  ),
  CONTEST_CONTESTANT_TIMELINE: withSlug(paths.CONTEST_CONTESTANT_TIMELINE),
  CONTEST_CONTESTANT_CLARIFICATIONS: withSlug(
    paths.CONTEST_CONTESTANT_CLARIFICATIONS,
  ),
  CONTEST_CONTESTANT_ANNOUNCEMENTS: withSlug(
    paths.CONTEST_CONTESTANT_ANNOUNCEMENTS,
  ),
  CONTEST_JURY: withSlug(paths.CONTEST_JURY),
  CONTEST_JURY_LEADERBOARD: withSlug(paths.CONTEST_JURY_LEADERBOARD),
  CONTEST_JURY_PROBLEMS: withSlug(paths.CONTEST_JURY_PROBLEMS),
  CONTEST_JURY_SUBMISSIONS: withSlug(paths.CONTEST_JURY_SUBMISSIONS),
  CONTEST_JURY_CLARIFICATIONS: withSlug(paths.CONTEST_JURY_CLARIFICATIONS),
  CONTEST_JURY_ANNOUNCEMENTS: withSlug(paths.CONTEST_JURY_ANNOUNCEMENTS),
  CONTEST_GUEST: withSlug(paths.CONTEST_GUEST),
  CONTEST_GUEST_LEADERBOARD: withSlug(paths.CONTEST_GUEST_LEADERBOARD),
  CONTEST_GUEST_PROBLEMS: withSlug(paths.CONTEST_GUEST_PROBLEMS),
  CONTEST_GUEST_TIMELINE: withSlug(paths.CONTEST_GUEST_TIMELINE),
  CONTEST_GUEST_CLARIFICATIONS: withSlug(paths.CONTEST_GUEST_CLARIFICATIONS),
  CONTEST_GUEST_ANNOUNCEMENTS: withSlug(paths.CONTEST_GUEST_ANNOUNCEMENTS),
};
