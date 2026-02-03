import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosContestRepository implements ContestRepository {
  private basePath = "/v1/contests";

  constructor(private readonly axiosClient: AxiosClient) {}

  async update(
    contestId: string,
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.put<ContestFullResponseDTO>(
      `${this.basePath}/${contestId}`,
      {
        data: requestDTO,
      },
    );
    return response.data;
  }

  async findAllMetadata(): Promise<ContestMetadataResponseDTO[]> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO[]>(
      `${this.basePath}/metadata`,
    );
    return response.data;
  }

  async findById(contestId: string): Promise<ContestPublicResponseDTO> {
    const response = await this.axiosClient.get<ContestPublicResponseDTO>(
      `${this.basePath}/${contestId}`,
    );
    return response.data;
  }

  async findMetadataBySlug(
    contestSlug: string,
  ): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO>(
      `${this.basePath}/slug/${contestSlug}/metadata`,
    );
    return response.data;
  }

  async findFullById(contestId: string): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.get<ContestFullResponseDTO>(
      `${this.basePath}/${contestId}/full`,
    );
    return response.data;
  }

  async forceStart(contestId: string): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.put<ContestMetadataResponseDTO>(
      `${this.basePath}/${contestId}:force-start`,
    );
    return response.data;
  }

  async forceEnd(contestId: string): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.put<ContestMetadataResponseDTO>(
      `${this.basePath}/${contestId}:force-end`,
    );
    return response.data;
  }
}
