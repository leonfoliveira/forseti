import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { MemberWithLoginResponseDTO } from "@/port/dto/response/member/MemberWithLoginResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";

export type ContestWithMembersAndProblemsDTO = ContestResponseDTO & {
  members: MemberWithLoginResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
};
