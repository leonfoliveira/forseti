export type Leaderboard = {
  rows: LeaderboardRow[];
};

export type LeaderboardRow = {
  memberName: string;
  score: number;
  cells: LeaderboardCell[];
};

export type LeaderboardCell = {
  isAccepted: boolean;
  wrongSubmissions: number;
};
