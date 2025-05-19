import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";

export interface SubmissionRepository {
  findAllForMember(): Promise<SubmissionResponseDTO[]>;
}
