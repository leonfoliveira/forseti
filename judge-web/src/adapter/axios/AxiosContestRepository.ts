import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { ProblemShortResponseDTO } from "@/core/repository/dto/response/ProblemShortResponseDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";
import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AxiosClient } from "@/adapter/axios/AxiosClient";

export class AxiosContestRepository implements ContestRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestResponseDTO> {
    return this.axiosClient.post<ContestResponseDTO>("/v1/contests", {
      data: requestDTO,
    });
  }

  deleteContest(id: number): Promise<void> {
    return this.axiosClient.delete(`/v1/contests/${id}`);
  }

  findAllContests(): Promise<ContestShortResponseDTO[]> {
    return this.axiosClient.get<ContestShortResponseDTO[]>("/v1/contests");
  }

  findAllProblems(id: number): Promise<ProblemShortResponseDTO[]> {
    return this.axiosClient.get<ProblemShortResponseDTO[]>(
      `/v1/contests/${id}/problems`,
    );
  }

  findAllProblemsForMember(id: number): Promise<ProblemShortResponseDTO[]> {
    return this.axiosClient.get<ProblemShortResponseDTO[]>(
      `/v1/contests/${id}/problems/member`,
    );
  }

  findAllSubmissions(id: number): Promise<SubmissionResponseDTO[]> {
    return this.axiosClient.get<SubmissionResponseDTO[]>(
      `/v1/contests/${id}/submissions`,
    );
  }

  findContestById(id: number): Promise<ContestShortResponseDTO> {
    return this.axiosClient.get<ContestShortResponseDTO>(`/v1/contests/${id}`);
  }

  findFullContestById(id: number): Promise<ContestResponseDTO> {
    return this.axiosClient.get<ContestResponseDTO>(`/v1/contests/${id}/full`);
  }

  getLeaderboard(id: number): Promise<LeaderboardOutputDTO> {
    return this.axiosClient.get<LeaderboardOutputDTO>(
      `/v1/contests/${id}/leaderboard`,
    );
  }

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestResponseDTO> {
    return this.axiosClient.put<ContestResponseDTO>(`/v1/contests`, {
      data: requestDTO,
    });
  }
}
