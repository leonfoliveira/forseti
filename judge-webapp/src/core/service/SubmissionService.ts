import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";

export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async createSubmission(
    contestId: string,
    inputDTO: CreateSubmissionInputDTO,
  ) {
    const attachment = await this.attachmentService.upload(
      contestId,
      AttachmentContext.SUBMISSION_CODE,
      inputDTO.code,
    );
    return await this.submissionRepository.createSubmission(contestId, {
      ...inputDTO,
      code: attachment,
    });
  }

  async findAllContestSubmissions(contestId: string) {
    return await this.submissionRepository.findAllContestSubmissions(contestId);
  }

  async findAllContestFullSubmissions(contestId: string) {
    return await this.submissionRepository.findAllContestFullSubmissions(
      contestId,
    );
  }

  async findAllFullForMember(
    contestId: string,
  ): Promise<SubmissionFullResponseDTO[]> {
    return await this.submissionRepository.findAllFullForMember(contestId);
  }

  async updateSubmissionAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<void> {
    return await this.submissionRepository.updateSubmissionAnswer(
      contestId,
      submissionId,
      answer,
    );
  }

  async rerunSubmission(
    contestId: string,
    submissionId: string,
  ): Promise<void> {
    return await this.submissionRepository.rerunSubmission(
      contestId,
      submissionId,
    );
  }
}
