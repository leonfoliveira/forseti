import { ClarificationRepository } from "@/core/repository/ClarificationRepository";

export class ClarificationService {
  constructor(
    private readonly clarificationRepository: ClarificationRepository,
  ) {}

  async deleteById(id: string): Promise<void> {
    await this.clarificationRepository.deleteById(id);
  }
}
