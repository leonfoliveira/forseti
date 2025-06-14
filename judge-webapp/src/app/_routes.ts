export const routes = {
  FORBIDDEN: "/forbidden",
  NOT_FOUND: "/not-found",
  ROOT: "/root",
  ROOT_CONTESTS: "/root/contests",
  ROOT_CONTESTS_NEW: "/root/contests/new",
  ROOT_CONTESTS_EDIT: (slug: string) => `/root/contests/${slug}`,
  ROOT_SIGN_IN: "/root/sign-in",
  CONTEST_SIGN_IN: (slug: string) => `/contests/${slug}/sign-in`,
  CONTEST: (slug: string) => `/contests/${slug}`,
  CONTEST_CONTESTANT: (slug: string) => `/contests/${slug}/contestant`,
  CONTEST_CONTESTANT_LEADERBOARD: (slug: string) =>
    `/contests/${slug}/contestant/leaderboard`,
  CONTEST_CONTESTANT_PROBLEMS: (slug: string) =>
    `/contests/${slug}/contestant/problems`,
  CONTEST_CONTESTANT_SUBMISSIONS: (slug: string) =>
    `/contests/${slug}/contestant/submissions`,
  CONTEST_CONTESTANT_TIMELINE: (slug: string) =>
    `/contests/${slug}/contestant/timeline`,
  CONTEST_JURY: (slug: string) => `/contests/${slug}/jury`,
  CONTEST_JURY_LEADERBOARD: (slug: string) =>
    `/contests/${slug}/jury/leaderboard`,
  CONTEST_JURY_PROBLEMS: (slug: string) => `/contests/${slug}/jury/problems`,
  CONTEST_JURY_SUBMISSIONS: (slug: string) =>
    `/contests/${slug}/jury/submissions`,
  CONTEST_GUEST: (slug: string) => `/contests/${slug}/guest`,
  CONTEST_GUEST_LEADERBOARD: (slug: string) =>
    `/contests/${slug}/guest/leaderboard`,
  CONTEST_GUEST_PROBLEMS: (slug: string) => `/contests/${slug}/guest/problems`,
  CONTEST_GUEST_TIMELINE: (slug: string) => `/contests/${slug}/guest/timeline`,
};
