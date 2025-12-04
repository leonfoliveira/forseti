export const routes = {
  CONTEST: (slug: string) => `/${slug}`,
  CONTEST_SIGN_IN: (slug: string) => `/${slug}/sign-in`,
  CONTEST_LEADERBOARD: (slug: string) => `/${slug}/leaderboard`,
  CONTEST_PROBLEMS: (slug: string) => `/${slug}/problems`,
  CONTEST_SUBMISSIONS: (slug: string) => `/${slug}/submissions`,
  CONTEST_CLARIFICATIONS: (slug: string) => `/${slug}/clarifications`,
  CONTEST_ANNOUNCEMENTS: (slug: string) => `/${slug}/announcements`,
  CONTEST_SETTINGS: (slug: string) => `/${slug}/settings`,
  FORBIDDEN: `/error/403`,
  NOT_FOUND: `/error/404`,
  INTERNAL_SERVER_ERROR: `/error/500`,
  SERVICE_UNAVAILABLE: `/error/503`,
};
