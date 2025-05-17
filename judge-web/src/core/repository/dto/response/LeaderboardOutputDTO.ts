export type LeaderboardOutputDTO = {
  contestId: number;
  problems: {
    id: number;
    title: string;
  }[];
  members: {
    id: number;
    name: string;
    problems: {
      id: number;
      wrongSubmissions: number;
      isAccepted: boolean;
      penalty: number;
    }[];
    score: number;
    penalty: number;
  }[];
};
