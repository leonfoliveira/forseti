import { AttachmentService } from "@/core/application/service/AttachmentService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import {
  CreateSubmissionInputDTO,
  SubmissionWritter,
} from "@/core/port/driving/usecase/submission/SubmissionWritter";

export class SubmissionService implements SubmissionWritter {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  /**
   * Create a submission for a contest.
   *
   * @param contestId ID of the contest
   * @param inputDTO Data for creating the submission
   * @return The created submission
   */
  async create(contestId: string, inputDTO: CreateSubmissionInputDTO) {
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

  /**
   * Update the answer for a submission.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission
   * @param answer The new answer for the submission
   */
  async updateAnswer(
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

  /**
   * Reenqueue a submission for re-evaluation.
   *
   * @param contestId ID of the contest
   * @param submissionId ID of the submission to rerun
   */
  async rerun(contestId: string, submissionId: string): Promise<void> {
    return await this.submissionRepository.rerunSubmission(
      contestId,
      submissionId,
    );
  }
}
