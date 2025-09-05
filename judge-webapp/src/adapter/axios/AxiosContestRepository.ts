import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";

export class AxiosContestRepository implements ContestRepository {
  private basePath = "/v1/contests";

  constructor(private readonly axiosClient: AxiosClient) {}

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

  async findContestById(contestId: string): Promise<ContestPublicResponseDTO> {
    const response = await this.axiosClient.get<ContestPublicResponseDTO>(
      `${this.basePath}/${contestId}`,
    );
    return response.data;
  }

  async findContestMetadataBySlug(
    contestSlug: string,
  ): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO>(
      `${this.basePath}/slug/${contestSlug}/metadata`,
    );
    return response.data;
  }

  async findFullContestById(
    contestId: string,
  ): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.get<ContestFullResponseDTO>(
      `${this.basePath}/${contestId}/full`,
    );
    return response.data;
  }

  async forceStart(contestId: string): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.put<ContestMetadataResponseDTO>(
      `${this.basePath}/${contestId}/start`,
    );
    return response.data;
  }

  async forceEnd(contestId: string): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.put<ContestMetadataResponseDTO>(
      `${this.basePath}/${contestId}/end`,
    );
    return response.data;
  }
}
