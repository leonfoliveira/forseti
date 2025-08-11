import { Attachment } from "@/core/domain/model/Attachment";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";

export class ContestService {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async createContest(input: CreateContestInputDTO) {
    const request = {
      ...input,
      problems: (await this.uploadFiles(
        input.problems,
      )) as CreateContestRequestDTO["problems"],
    };
    return await this.contestRepository.createContest(request);
  }

  async updateContest(input: UpdateContestInputDTO) {
    const request = {
      ...input,
      problems: await this.uploadFiles(input.problems),
    };
    return await this.contestRepository.updateContest(request);
  }

  async findAllContestMetadata() {
    return await this.contestRepository.findAllContestMetadata();
  }

  async findContestById(id: string) {
    return await this.contestRepository.findContestById(id);
  }

  async findContestMetadataBySlug(slug: string) {
    return await this.contestRepository.findContestMetadataBySlug(slug);
  }

  async findFullContestById(id: string) {
    return await this.contestRepository.findFullContestById(id);
  }

  async findContestLeaderboardById(id: string) {
    return await this.contestRepository.findContestLeaderboardById(id);
  }

  async forceStart(id: string) {
    return await this.contestRepository.forceStart(id);
  }

  async forceEnd(id: string) {
    return await this.contestRepository.forceEnd(id);
  }

  async deleteContest(id: string) {
    await this.contestRepository.deleteContest(id);
  }

  async findAllContestSubmissions(id: string) {
    return await this.contestRepository.findAllContestSubmissions(id);
  }

  async findAllContestFullSubmissions(id: string) {
    return await this.contestRepository.findAllContestFullSubmissions(id);
  }

  async createAnnouncement(id: string, inputDTO: CreateAnnouncementRequestDTO) {
    return await this.contestRepository.createAnnouncement(id, inputDTO);
  }

  async createClarification(
    id: string,
    inputDTO: CreateClarificationRequestDTO,
  ) {
    return await this.contestRepository.createClarification(id, inputDTO);
  }

  private async uploadFiles(
    problems: UpdateContestInputDTO["problems"],
  ): Promise<UpdateContestRequestDTO["problems"]> {
    return await Promise.all(
      problems.map(async (it) => {
        const description = it.newDescription
          ? await this.attachmentService.upload(it.newDescription)
          : (it.description as Attachment);

        const testCases = it.newTestCases
          ? await this.attachmentService.upload(it.newTestCases)
          : (it.testCases as Attachment);

        return {
          ...it,
          description,
          testCases,
        };
      }),
    );
  }
}
