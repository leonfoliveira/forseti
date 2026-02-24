export type LeaderboardCellResponseDTO = {
  memberId: string;
  problemId: string;
  problemLetter: string;
  problemColor: string;
  letter: string;
  isAccepted: boolean;
  acceptedAt?: string;
  wrongSubmissions: number;
  penalty: number;
};
