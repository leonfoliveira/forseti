export type LeaderboardResponseDTO = {
  contestId: string;
  contestStartAt: string;
  isFrozen: boolean;
  issuedAt: string;
  rows: {
    memberId: string;
    memberName: string;
    score: number;
    penalty: number;
    cells: {
      problemId: string;
      problemLetter: string;
      problemColor: string;
      isAccepted: boolean;
      acceptedAt?: string;
      wrongSubmissions: number;
      penalty: number;
    }[];
  }[];
};
