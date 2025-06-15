import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export class AxiosContestRepository implements ContestRepository {
  private basePath = "/v1/contests";

  constructor(private readonly axiosClient: AxiosClient) {}

  async createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.post<ContestFullResponseDTO>(
      this.basePath,
      {
        data: requestDTO,
      },
    );
    return response.data;
  }

  async updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.put<ContestFullResponseDTO>(
      this.basePath,
      {
        data: requestDTO,
      },
    );
    return response.data;
  }

  async findAllContestMetadata(): Promise<ContestMetadataResponseDTO[]> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO[]>(
      `${this.basePath}/metadata`,
    );
    return response.data;
  }

  async findContestById(id: string): Promise<ContestPublicResponseDTO> {
    const response = await this.axiosClient.get<ContestPublicResponseDTO>(
      `${this.basePath}/${id}`,
    );
    return response.data;
  }

  async findContestMetadataBySlug(
    slug: string,
  ): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO>(
      `${this.basePath}/slug/${slug}/metadata`,
    );
    return response.data;
  }

  async findFullContestById(id: string): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.get<ContestFullResponseDTO>(
      `${this.basePath}/${id}/full`,
    );
    return response.data;
  }

  async findContestLeaderboardById(
    id: string,
  ): Promise<ContestLeaderboardResponseDTO> {
    const response = await this.axiosClient.get<ContestLeaderboardResponseDTO>(
      `${this.basePath}/${id}/leaderboard`,
    );
    return response.data;
  }

  async forceStart(id: string): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.put<ContestMetadataResponseDTO>(
      `${this.basePath}/${id}/start`,
    );
    return response.data;
  }

  async forceEnd(id: string): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.put<ContestMetadataResponseDTO>(
      `${this.basePath}/${id}/end`,
    );
    return response.data;
  }

  deleteContest(id: string): Promise<void> {
    return this.axiosClient.delete(`${this.basePath}/${id}`);
  }

  async findAllContestSubmissions(
    id: string,
  ): Promise<SubmissionPublicResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      `${this.basePath}/${id}/submissions`,
    );
    return response.data;
  }

  async findAllContestFullSubmissions(
    id: string,
  ): Promise<SubmissionFullResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      `${this.basePath}/${id}/submissions/full`,
    );
    return response.data;
  }
}
