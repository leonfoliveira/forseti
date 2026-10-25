import { AnswerClarificationRequestDTO } from "@/port/dto/request/clarification/AnswerClarificationRequestDTO";
import { CreateClarificationRequestDTO } from "@/port/dto/request/clarification/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ClarificationWriter } from "@/port/input/usecase/clarification/ClarificationWriter";

export class ClarificationService implements ClarificationWriter {
  constructor(private readonly clarificationRepository: ClarificationWriter) {}

  async create(
    contestId: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO> {
    return await this.clarificationRepository.create(contestId, requestDTO);
  }
  async answer(
    contestId: string,
    clarificationId: string,
    requestDTO: AnswerClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO> {
    return await this.clarificationRepository.answer(
      contestId,
      clarificationId,
      requestDTO,
    );
  }
  async publish(
    contestId: string,
    clarificationId: string,
  ): Promise<ClarificationResponseDTO> {
    return await this.clarificationRepository.publish(
      contestId,
      clarificationId,
    );
  }
}
