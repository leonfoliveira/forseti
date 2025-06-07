import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";

export class AxiosContestRepository implements ContestRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.post<ContestFullResponseDTO>(
      "/v1/contests",
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
      `/v1/contests`,
      {
        data: requestDTO,
      },
    );
    return response.data;
  }

  async findAllContestMetadata(): Promise<ContestMetadataResponseDTO[]> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO[]>(
      "/v1/contests/metadata",
    );
    return response.data;
  }

  async findContestById(id: string): Promise<ContestResponseDTO> {
    const response = await this.axiosClient.get<ContestResponseDTO>(
      `/v1/contests/${id}`,
    );
    return response.data;
  }

  async findContestMetadataById(
    id: string,
  ): Promise<ContestMetadataResponseDTO> {
    const response = await this.axiosClient.get<ContestMetadataResponseDTO>(
      `/v1/contests/${id}/metadata`,
    );
    return response.data;
  }

  async findFullContestById(id: string): Promise<ContestFullResponseDTO> {
    const response = await this.axiosClient.get<ContestFullResponseDTO>(
      `/v1/contests/${id}/full`,
    );
    return response.data;
  }

  async findAllProblems(id: string): Promise<ProblemPublicResponseDTO[]> {
    const response = await this.axiosClient.get<ProblemPublicResponseDTO[]>(
      `/v1/contests/${id}/problems`,
    );
    return response.data;
  }

  deleteContest(id: string): Promise<void> {
    return this.axiosClient.delete(`/v1/contests/${id}`);
  }

  async findAllContestSubmissions(
    id: string,
  ): Promise<SubmissionPublicResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      `/v1/contests/${id}/submissions`,
    );
    return response.data;
  }

  async findAllContestFullSubmissions(
    id: string,
  ): Promise<SubmissionFullResponseDTO[]> {
    const response = await this.axiosClient.get<SubmissionFullResponseDTO[]>(
      `/v1/contests/${id}/submissions/full`,
    );
    return response.data;
  }
}
