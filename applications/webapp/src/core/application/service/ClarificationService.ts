import { ClarificationRepository } from "@/core/port/driven/repository/ClarificationRepository";
import { ClarificationWritter } from "@/core/port/driving/usecase/clarification/ClarificationWritter";
import { CreateClarificationRequestDTO } from "@/core/port/dto/request/CreateClarificationRequestDTO";

export class ClarificationService implements ClarificationWritter {
  constructor(
    private readonly clarificationRepository: ClarificationRepository,
  ) {}

  async create(contestId: string, inputDTO: CreateClarificationRequestDTO) {
    return await this.clarificationRepository.create(contestId, inputDTO);
  }

  async deleteById(contestId: string, clarificationId: string): Promise<void> {
    await this.clarificationRepository.deleteById(contestId, clarificationId);
  }
}
