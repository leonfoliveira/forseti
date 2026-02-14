export type Leaderboard = {
  members: LeaderboardMember[];
};

export type LeaderboardMember = {
  name: string;
  score: number;
  problems: LeaderboardProblem[];
};

export type LeaderboardProblem = {
  isAccepted: boolean;
  wrongSubmissions: number;
};
