import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";

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

  async createAnnouncement(
    id: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO> {
    const response = await this.axiosClient.post<AnnouncementResponseDTO>(
      `${this.basePath}/${id}/announcements`,
      { data: requestDTO },
    );
    return response.data;
  }

  async createClarification(
    id: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO> {
    const response = await this.axiosClient.post<ClarificationResponseDTO>(
      `${this.basePath}/${id}/clarifications`,
      { data: requestDTO },
    );
    return response.data;
  }
}
