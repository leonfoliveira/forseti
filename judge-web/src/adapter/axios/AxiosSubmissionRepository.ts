import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";
import { SubmissionRepository } from "@/core/repository/SubmissionRepository";

export class AxiosSubmissionRepository implements SubmissionRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  findAllForMember(): Promise<SubmissionResponseDTO[]> {
    return this.axiosClient.get<SubmissionResponseDTO[]>(`/v1/submissions`);
  }
}
