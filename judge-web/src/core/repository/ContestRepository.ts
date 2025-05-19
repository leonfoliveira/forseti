import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { ProblemShortResponseDTO } from "@/core/repository/dto/response/ProblemShortResponseDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";

export interface ContestRepository {
  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestResponseDTO>;

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestResponseDTO>;

  findAllContests(): Promise<ContestShortResponseDTO[]>;

  findFullContestById(id: number): Promise<ContestResponseDTO>;

  findContestById(id: number): Promise<ContestShortResponseDTO>;

  deleteContest(id: number): Promise<void>;

  getLeaderboard(id: number): Promise<LeaderboardOutputDTO>;

  findAllProblems(id: number): Promise<ProblemShortResponseDTO[]>;

  findAllProblemsForMember(id: number): Promise<ProblemShortResponseDTO[]>;

  findAllSubmissions(id: number): Promise<SubmissionResponseDTO[]>;
}
