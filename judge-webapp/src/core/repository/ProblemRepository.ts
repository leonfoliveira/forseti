import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";

export interface ProblemRepository {
  createSubmission(
    id: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO>;
}
