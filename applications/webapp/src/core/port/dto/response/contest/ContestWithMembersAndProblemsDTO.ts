import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";
import { MemberWithLoginResponseDTO } from "@/core/port/dto/response/member/MemberWithLoginResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/core/port/dto/response/problem/ProblemWithTestCasesResponseDTO";

export type ContestWithMembersAndProblemsDTO = ContestResponseDTO & {
  members: MemberWithLoginResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
};
