import { ContestRepository } from "@/port/output/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/port/dto/request/UpdateContestRequestDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

export class AxiosContestRepository implements ContestRepository {
  private basePath = "/v1/contests";

  constructor(private readonly axiosClient: AxiosClient) {}

  async update(
    contestId: string,
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestWithMembersAndProblemsResponseDTO> {
    const response =
      await this.axiosClient.put<ContestWithMembersAndProblemsResponseDTO>(
        `${this.basePath}/${contestId}`,
        {
          data: requestDTO,
        },
      );
    return response.data;
  }

  async findBySlug(contestSlug: string): Promise<ContestResponseDTO> {
    const response = await this.axiosClient.get<ContestResponseDTO>(
      `${this.basePath}/slug/${contestSlug}`,
    );
    return response.data;
  }

  async freeze(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO> {
    const response =
      await this.axiosClient.patch<ContestWithMembersAndProblemsResponseDTO>(
        `${this.basePath}/${contestId}:freeze`,
      );
    return response.data;
  }

  async unfreeze(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO> {
    const response =
      await this.axiosClient.patch<ContestWithMembersAndProblemsResponseDTO>(
        `${this.basePath}/${contestId}:unfreeze`,
      );
    return response.data;
  }

  async forceStart(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO> {
    const response =
      await this.axiosClient.patch<ContestWithMembersAndProblemsResponseDTO>(
        `${this.basePath}/${contestId}:force-start`,
      );
    return response.data;
  }

  async forceEnd(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsResponseDTO> {
    const response =
      await this.axiosClient.patch<ContestWithMembersAndProblemsResponseDTO>(
        `${this.basePath}/${contestId}:force-end`,
      );
    return response.data;
  }
}
