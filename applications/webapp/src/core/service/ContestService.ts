import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";

export class ContestService {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async updateContest(inputDTO: UpdateContestInputDTO) {
    const request = {
      ...inputDTO,
      problems: await this.uploadFiles(inputDTO.id, inputDTO.problems),
    };
    return await this.contestRepository.updateContest(request);
  }

  async findAllContestMetadata() {
    return await this.contestRepository.findAllContestMetadata();
  }

  async findContestById(contestId: string) {
    return await this.contestRepository.findContestById(contestId);
  }

  async findContestMetadataBySlug(slug: string) {
    return await this.contestRepository.findContestMetadataBySlug(slug);
  }

  async findFullContestById(contestId: string) {
    return await this.contestRepository.findFullContestById(contestId);
  }

  async forceStart(contestId: string) {
    return await this.contestRepository.forceStart(contestId);
  }

  async forceEnd(contestId: string) {
    return await this.contestRepository.forceEnd(contestId);
  }

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
