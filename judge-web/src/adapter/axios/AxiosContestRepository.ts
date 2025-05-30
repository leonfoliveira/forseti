import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/LeaderboardResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/ContestPublicResponseDTO";

export class AxiosContestRepository implements ContestRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestPrivateResponseDTO> {
    const response = await this.axiosClient.post<ContestPrivateResponseDTO>(
      "/v1/contests",
      {
        data: requestDTO,
      },
    );
    return response.data;
  }

  deleteContest(id: number): Promise<void> {
    return this.axiosClient.delete(`/v1/contests/${id}`);
  }

  async findAllContests(): Promise<ContestSummaryResponseDTO[]> {
    const response =
      await this.axiosClient.get<ContestSummaryResponseDTO[]>("/v1/contests");
    return response.data;
  }

  async findAllProblems(id: number): Promise<ProblemPublicResponseDTO[]> {
    const response = await this.axiosClient.get<ProblemPublicResponseDTO[]>(
      `/v1/contests/${id}/problems`,
    );
    return response.data;
  }

  async findAllProblemsForMember(
    id: number,
  ): Promise<ProblemMemberResponseDTO[]> {
    const response = await this.axiosClient.get<ProblemMemberResponseDTO[]>(
      `/v1/contests/${id}/problems/me`,
    );
    return response.data;
  }

  async findAllSubmissions(
    id: number,
  ): Promise<SubmissionPrivateResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionPrivateResponseDTO[]>(
      `/v1/contests/${id}/submissions`,
    );
    return response.data;
  }

  async findContestById(id: number): Promise<ContestPublicResponseDTO> {
    const response = await this.axiosClient.get<ContestPublicResponseDTO>(
      `/v1/contests/${id}`,
    );
    return response.data;
  }

  async findContestByIdForRoot(id: number): Promise<ContestPrivateResponseDTO> {
    const response = await this.axiosClient.get<ContestPrivateResponseDTO>(
      `/v1/contests/${id}/root`,
    );
    return response.data;
  }

  async findContestSummaryById(id: number): Promise<ContestSummaryResponseDTO> {
    const response = await this.axiosClient.get<ContestSummaryResponseDTO>(
      `/v1/contests/${id}/summary`,
    );
    return response.data;
  }

  async getLeaderboard(id: number): Promise<LeaderboardResponseDTO> {
    const response = await this.axiosClient.get<LeaderboardResponseDTO>(
      `/v1/contests/${id}/leaderboard`,
    );
    return response.data;
  }

  async updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestPrivateResponseDTO> {
    const response = await this.axiosClient.put<ContestPrivateResponseDTO>(
      `/v1/contests`,
      {
        data: requestDTO,
      },
    );
    return response.data;
  }
}
