import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { LeaderboardListener } from "@/core/listener/LeaderboardListener";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export class ContestService {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly attachmentService: AttachmentService,
    private readonly leaderboardListener: LeaderboardListener,
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

  subscribeForLeaderboard(
    contestId: string,
    cb: (leaderboard: ContestLeaderboardResponseDTO) => void,
  ): Promise<ListenerClient> {
    return this.leaderboardListener.subscribeForLeaderboard(contestId, cb);
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
