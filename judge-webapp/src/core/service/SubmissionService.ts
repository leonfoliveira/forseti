import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

export class SubmissionService {
  constructor(private readonly submissionRepository: SubmissionRepository) {}

  async findAllFullForMember(): Promise<SubmissionFullResponseDTO[]> {
    return await this.submissionRepository.findAllFullForMember();
  }

  async updateSubmissionAnswer(
    id: string,
    data: UpdateSubmissionAnswerRequestDTO,
  ): Promise<void> {
    return await this.submissionRepository.updateSubmissionAnswer(id, data);
  }

  async rerunSubmission(id: string): Promise<void> {
    return await this.submissionRepository.rerunSubmission(id);
  }
}
