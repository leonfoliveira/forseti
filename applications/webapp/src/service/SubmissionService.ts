import { AttachmentService } from "@/service/AttachmentService";
import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/port/output/repository/SubmissionRepository";
import {
  CreateSubmissionInputDTO,
  SubmissionWritter,
} from "@/port/input/usecase/submission/SubmissionWritter";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

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
  ): Promise<SubmissionWithCodeResponseDTO> {
    return await this.submissionRepository.updateAnswer(
      contestId,
      submissionId,
      answer,
    );
  }

  async resubmit(
    contestId: string,
    submissionId: string,
  ): Promise<SubmissionWithCodeResponseDTO> {
    return await this.submissionRepository.resubmit(contestId, submissionId);
  }
}
