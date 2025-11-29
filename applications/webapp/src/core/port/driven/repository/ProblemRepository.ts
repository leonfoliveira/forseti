import { CreateSubmissionRequestDTO } from "@/core/port/driven/repository/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionFullResponseDTO";

export interface ProblemRepository {
  createSubmission(
    id: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO>;
}
