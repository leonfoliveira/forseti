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
import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export class ContestService implements ContestWritter, ContestReader {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async update(contestId: string, inputDTO: UpdateContestInputDTO) {
    const request = {
      ...inputDTO,
      problems: await this.uploadFiles(contestId, inputDTO.problems),
    };
    return await this.contestRepository.update(contestId, request);
  }

  async findBySlug(slug: string): Promise<ContestResponseDTO> {
    return await this.contestRepository.findBySlug(slug);
  }

  async forceStart(
    contestId: string,
  ): Promise<ContestWithMembersAndProblemsDTO> {
    return await this.contestRepository.forceStart(contestId);
  }

  async forceEnd(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
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
