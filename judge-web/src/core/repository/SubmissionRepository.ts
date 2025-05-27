import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";

export interface SubmissionRepository {
  findAllForMember(): Promise<SubmissionPrivateResponseDTO[]>;

  createSubmission(
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionPrivateResponseDTO>;
}
