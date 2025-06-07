import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";
import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

export class AxiosSubmissionRepository implements SubmissionRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async createSubmission(
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO> {
    const response = await this.axiosClient.post<SubmissionFullResponseDTO>(
      "/v1/submissions",
      {
        data: request,
      },
    );
    return response.data;
  }

  async findAllFullForMember(): Promise<SubmissionFullResponseDTO[]> {
    const response =
      await this.axiosClient.get<SubmissionFullResponseDTO[]>(
        "/v1/submissions/me",
      );
    return response.data;
  }

  async updateSubmissionAnswer(
    id: string,
    data: UpdateSubmissionAnswerRequestDTO,
  ): Promise<void> {
    await this.axiosClient.patch<void>(`/v1/submissions/${id}/judge`, {
      data,
    });
  }

  async rerunSubmission(id: string): Promise<void> {
    await this.axiosClient.post<void>(`/v1/submissions/${id}/rerun`);
  }
}
