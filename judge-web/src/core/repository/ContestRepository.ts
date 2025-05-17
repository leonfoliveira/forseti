import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { ProblemResponseDTO } from "@/core/repository/dto/response/ProblemResponseDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";

export interface ContestRepository {
  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  findAllContests(): Promise<ContestResponseDTO[]>;

  findFullContestById(id: number): Promise<ContestFullResponseDTO>;

  findContestById(id: number): Promise<ContestResponseDTO>;

  deleteContest(id: number): Promise<void>;

  getLeaderboard(id: number): Promise<LeaderboardOutputDTO>;

  findAllProblems(id: number): Promise<ProblemResponseDTO[]>;

  findAllProblemsForMember(id: number): Promise<ProblemResponseDTO[]>;

  findAllSubmissions(id: number): Promise<SubmissionResponseDTO[]>;
}
