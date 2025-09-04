import { Attachment } from "@/core/domain/model/Attachment";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
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
      problems: await this.uploadFiles(inputDTO.problems),
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
    problems: UpdateContestInputDTO["problems"],
  ): Promise<UpdateContestRequestDTO["problems"]> {
    return await Promise.all(
      problems.map(async (it) => {
        const [description, testCases] = await Promise.all([
          it.newDescription
            ? await this.attachmentService.upload(it.newDescription)
            : (it.description as Attachment),
          it.newTestCases
            ? await this.attachmentService.upload(it.newTestCases)
            : (it.testCases as Attachment),
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
