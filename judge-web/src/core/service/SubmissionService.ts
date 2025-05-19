import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";

export class SubmissionService {
  constructor(private submissionRepository: SubmissionRepository) {}

  async createUploadAttachment(): Promise<SubmissionResponseDTO[]> {
    return this.submissionRepository.findAllForMember();
  }
}
