import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/ContestPublicResponseDTO";

export interface ContestRepository {
  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestPrivateResponseDTO>;

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestPrivateResponseDTO>;

  findAllContests(): Promise<ContestSummaryResponseDTO[]>;

  findContestByIdForRoot(id: number): Promise<ContestPrivateResponseDTO>;

  findContestById(id: number): Promise<ContestPublicResponseDTO>;

  findContestSummaryById(id: number): Promise<ContestSummaryResponseDTO>;

  deleteContest(id: number): Promise<void>;

  getLeaderboard(id: number): Promise<LeaderboardOutputDTO>;

  findAllProblems(id: number): Promise<ProblemPublicResponseDTO[]>;

  findAllProblemsForMember(id: number): Promise<ProblemMemberResponseDTO[]>;

  findAllSubmissions(id: number): Promise<SubmissionPublicResponseDTO[]>;
}
