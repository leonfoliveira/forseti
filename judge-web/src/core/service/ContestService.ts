import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";
import { ContestUtil } from "@/core/util/contest-util";

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
    const response = await this.contestRepository.createContest(request);
    return ContestUtil.addStatus(response);
  }

  async updateContest(input: UpdateContestInputDTO) {
    const request = {
      ...input,
      problems: await this.uploadFiles(input.problems),
    };
    const response = await this.contestRepository.updateContest(request);
    return ContestUtil.addStatus(response);
  }

  async findAllContestMetadata() {
    const response = await this.contestRepository.findAllContestMetadata();
    return response.map(ContestUtil.addStatus);
  }

  async findContestById(id: string) {
    const response = await this.contestRepository.findContestById(id);
    return ContestUtil.addStatus(response);
  }

  async findContestMetadataById(id: string) {
    const response = await this.contestRepository.findContestMetadataById(id);
    return ContestUtil.addStatus(response);
  }

  async findFullContestById(id: string) {
    const response = await this.contestRepository.findFullContestById(id);
    return ContestUtil.addStatus(response);
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
