import { AttachmentService } from "@/core/application/service/AttachmentService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import {
  CreateSubmissionInputDTO,
  SubmissionWritter,
} from "@/core/port/driving/usecase/submission/SubmissionWritter";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export class SubmissionService implements SubmissionWritter {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async create(
    contestId: string,
    inputDTO: CreateSubmissionInputDTO,
  ): Promise<SubmissionWithCodeResponseDTO> {
    const attachment = await this.attachmentService.upload(
      contestId,
      AttachmentContext.SUBMISSION_CODE,
      inputDTO.code,
    );
    return await this.submissionRepository.create(contestId, {
      ...inputDTO,
      code: attachment,
    });
  }

  async updateAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO> {
    return await this.submissionRepository.updateAnswer(
      contestId,
      submissionId,
      answer,
    );
  }

  async rerun(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeAndExecutionsResponseDTO> {
    return await this.submissionRepository.rerun(contestId, submissionId);
  }
}
