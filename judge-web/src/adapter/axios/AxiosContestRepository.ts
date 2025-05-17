import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { ProblemResponseDTO } from "@/core/repository/dto/response/ProblemResponseDTO";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";
import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AxiosClient } from "@/adapter/axios/AxiosClient";

export class AxiosContestRepository implements ContestRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestFullResponseDTO> {
    return this.axiosClient.post<ContestFullResponseDTO>(
      "/v1/contests",
      requestDTO,
    );
  }

  deleteContest(id: number): Promise<void> {
    return this.axiosClient.delete<void>(`/v1/contests/${id}`);
  }

  findAllContests(): Promise<ContestResponseDTO[]> {
    return this.axiosClient.get<ContestResponseDTO[]>("/v1/contests");
  }

  findAllProblems(id: number): Promise<ProblemResponseDTO[]> {
    return this.axiosClient.get<ProblemResponseDTO[]>(
      `/v1/contests/${id}/problems`,
    );
  }

  findAllProblemsForMember(id: number): Promise<ProblemResponseDTO[]> {
    return this.axiosClient.get<ProblemResponseDTO[]>(
      `/v1/contests/${id}/problems/member`,
    );
  }

  findAllSubmissions(id: number): Promise<SubmissionResponseDTO[]> {
    return this.axiosClient.get<SubmissionResponseDTO[]>(
      `/v1/contests/${id}/submissions`,
    );
  }

  findContestById(id: number): Promise<ContestResponseDTO> {
    return this.axiosClient.get<ContestResponseDTO>(`/v1/contests/${id}`);
  }

  findFullContestById(id: number): Promise<ContestFullResponseDTO> {
    return this.axiosClient.get<ContestFullResponseDTO>(
      `/v1/contests/${id}/full`,
    );
  }

  getLeaderboard(id: number): Promise<LeaderboardOutputDTO> {
    return this.axiosClient.get<LeaderboardOutputDTO>(
      `/v1/contests/${id}/leaderboard`,
    );
  }

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO> {
    return this.axiosClient.put<ContestFullResponseDTO>(
      `/v1/contests/${requestDTO.id}`,
      requestDTO,
    );
  }
}
