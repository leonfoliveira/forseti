export type LeaderboardPartialResponseDTO = {
  memberId: string;
  problemId: string;
  letter: string;
  isAccepted: boolean;
  acceptedAt?: string;
  wrongSubmissions: number;
  penalty: number;
};
