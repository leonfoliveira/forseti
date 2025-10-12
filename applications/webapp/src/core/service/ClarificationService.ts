import { ClarificationRepository } from "@/core/repository/ClarificationRepository";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";

export class ClarificationService {
  constructor(
    private readonly clarificationRepository: ClarificationRepository,
  ) {}

  async createClarification(
    contestId: string,
    inputDTO: CreateClarificationRequestDTO,
  ) {
    return await this.clarificationRepository.createClarification(
      contestId,
      inputDTO,
    );
  }

  async deleteById(contestId: string, clarificationId: string): Promise<void> {
    await this.clarificationRepository.deleteById(contestId, clarificationId);
  }
}
