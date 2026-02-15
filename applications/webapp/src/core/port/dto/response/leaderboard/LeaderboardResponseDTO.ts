export type LeaderboardResponseDTO = {
  contestId: string;
  isFrozen: boolean;
  slug: string;
  startAt: string;
  issuedAt: string;
  members: {
    id: string;
    name: string;
    score: number;
    penalty: number;
    problems: {
      id: string;
      letter: string;
      isAccepted: boolean;
      acceptedAt?: string;
      wrongSubmissions: number;
      penalty: number;
    }[];
  }[];
};
