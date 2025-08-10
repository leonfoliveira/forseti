export const routes = {
  HOME: "/",
  NOT_FOUND: "/not-found",
  FORBIDDEN: "/forbidden",
  ROOT: "/root",
  ROOT_CONTESTS: "/root/contests",
  ROOT_CONTESTS_NEW: "/root/contests/new",
  ROOT_CONTESTS_EDIT: (id: string) => `/root/contests/${id}`,
  ROOT_SIGN_IN: `/root/sign-in`,
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
  CONTEST_CONTESTANT_CLARIFICATIONS: (slug: string) =>
    `/contests/${slug}/contestant/clarifications`,
  CONTEST_CONTESTANT_ANNOUNCEMENTS: (slug: string) =>
    `/contests/${slug}/contestant/announcements`,
  CONTEST_JUDGE: (slug: string) => `/contests/${slug}/judge`,
  CONTEST_JUDGE_LEADERBOARD: (slug: string) =>
    `/contests/${slug}/judge/leaderboard`,
  CONTEST_JUDGE_PROBLEMS: (slug: string) => `/contests/${slug}/judge/problems`,
  CONTEST_JUDGE_SUBMISSIONS: (slug: string) =>
    `/contests/${slug}/judge/submissions`,
  CONTEST_JUDGE_CLARIFICATIONS: (slug: string) =>
    `/contests/${slug}/judge/clarifications`,
  CONTEST_JUDGE_ANNOUNCEMENTS: (slug: string) =>
    `/contests/${slug}/judge/announcements`,
  CONTEST_GUEST: (slug: string) => `/contests/${slug}/guest`,
  CONTEST_GUEST_LEADERBOARD: (slug: string) =>
    `/contests/${slug}/guest/leaderboard`,
  CONTEST_GUEST_PROBLEMS: (slug: string) => `/contests/${slug}/guest/problems`,
  CONTEST_GUEST_TIMELINE: (slug: string) => `/contests/${slug}/guest/timeline`,
  CONTEST_GUEST_CLARIFICATIONS: (slug: string) =>
    `/contests/${slug}/guest/clarifications`,
  CONTEST_GUEST_ANNOUNCEMENTS: (slug: string) =>
    `/contests/${slug}/guest/announcements`,
};
