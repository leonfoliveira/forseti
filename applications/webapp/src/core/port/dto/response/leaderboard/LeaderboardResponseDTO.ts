import { MemberType } from "@/core/domain/enumerate/MemberType";

export type LeaderboardResponseDTO = {
  contestId: string;
  contestStartAt: string;
  isFrozen: boolean;
  issuedAt: string;
  rows: {
    memberId: string;
    memberName: string;
    memberType: MemberType;
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
