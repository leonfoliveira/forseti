import { AttachmentService } from "@/core/application/service/AttachmentService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { ContestReader } from "@/core/port/driving/usecase/contest/ContestReader";
import {
  ContestWritter,
  UpdateContestInputDTO,
} from "@/core/port/driving/usecase/contest/ContestWritter";
import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";

export class ContestService implements ContestWritter, ContestReader {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  /**
   * Update contest details.
   *
   * @param inputDTO Data for updating the contest
   * @return The updated contest details
   */
  async update(inputDTO: UpdateContestInputDTO) {
    const request = {
      ...inputDTO,
      problems: await this.uploadFiles(inputDTO.id, inputDTO.problems),
    };
    return await this.contestRepository.update(request);
  }

  /**
   * Find contest metadata by its slug.
   *
   * @param slug Slug of the contest
   * @return The contest metadata
   */
  async findMetadataBySlug(slug: string): Promise<ContestMetadataResponseDTO> {
    return await this.contestRepository.findMetadataBySlug(slug);
  }

  /**
   * Force start a contest immediately.
   *
   * @param contestId ID of the contest to start
   * @return The updated contest metadata
   */
  async forceStart(contestId: string) {
    return await this.contestRepository.forceStart(contestId);
  }

  /**
   * Force end a contest immediately.
   *
   * @param contestId ID of the contest to end
   * @return The updated contest metadata
   */
  async forceEnd(contestId: string) {
    return await this.contestRepository.forceEnd(contestId);
  }

  /**
   * Upload problem files for the contest.
   *
   * @param contestId ID of the contest
   * @param problems List of problems to upload files for
   * @returns The RequestDTO with created attachments
   */
  private async uploadFiles(
    contestId: string,
    problems: UpdateContestInputDTO["problems"],
  ): Promise<UpdateContestRequestDTO["problems"]> {
    return await Promise.all(
      problems.map(async (it) => {
        const [description, testCases] = await Promise.all([
          it.newDescription
            ? await this.attachmentService.upload(
                contestId,
                AttachmentContext.PROBLEM_DESCRIPTION,
                it.newDescription,
              )
            : (it.description as AttachmentResponseDTO),
          it.newTestCases
            ? await this.attachmentService.upload(
                contestId,
                AttachmentContext.PROBLEM_TEST_CASES,
                it.newTestCases,
              )
            : (it.testCases as AttachmentResponseDTO),
        ]);

        return {
          ...it,
          description,
          testCases,
        };
      }),
    );
  }
}
