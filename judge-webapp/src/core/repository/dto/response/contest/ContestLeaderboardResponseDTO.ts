export type ContestLeaderboardResponseDTO = {
  contestId: string;
  slug: string;
  startAt: string;
  issuedAt: string;
  classification: {
    memberId: string;
    name: string;
    score: number;
    penalty: number;
    problems: {
      problemId: string;
      letter: string;
      isAccepted: boolean;
      acceptedAt?: string;
      wrongSubmissions: number;
      penalty: number;
    }[];
  }[];
};
