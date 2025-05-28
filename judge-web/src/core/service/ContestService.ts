import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { ContestOutputDTOMap } from "@/core/service/dto/output/ContestOutputDTO";
import { Attachment } from "@/core/domain/model/Attachment";
import { ContestSummaryOutputDTOMap } from "@/core/service/dto/output/ContestSummaryOutputDTO";
import { ContestPublicOutputDTOMap } from "@/core/service/dto/output/ContestPublicOutputDTO";

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
    return ContestOutputDTOMap.fromResponseDTO(response);
  }

  async updateContest(input: UpdateContestInputDTO) {
    const request = {
      ...input,
      problems: await this.uploadFiles(input.problems),
    };
    const response = await this.contestRepository.updateContest(request);
    return ContestOutputDTOMap.fromResponseDTO(response);
  }

  async findAllContests() {
    const response = await this.contestRepository.findAllContests();
    return response.map(ContestSummaryOutputDTOMap.fromResponseDTO);
  }

  async findContestByIdForRoot(id: number) {
    const response = await this.contestRepository.findContestByIdForRoot(id);
    return ContestOutputDTOMap.fromResponseDTO(response);
  }

  async findContestById(id: number) {
    const response = await this.contestRepository.findContestById(id);
    return ContestPublicOutputDTOMap.fromResponseDTO(response);
  }

  async findContestSummaryById(id: number) {
    const response = await this.contestRepository.findContestSummaryById(id);
    return ContestSummaryOutputDTOMap.fromResponseDTO(response);
  }

  deleteContest(id: number) {
    return this.contestRepository.deleteContest(id);
  }

  getLeaderboard(id: number) {
    return this.contestRepository.getLeaderboard(id);
  }

  findAllProblems(id: number) {
    return this.contestRepository.findAllProblems(id);
  }

  findAllProblemsForMember(id: number) {
    return this.contestRepository.findAllProblemsForMember(id);
  }

  findAllSubmissions(id: number) {
    return this.contestRepository.findAllSubmissions(id);
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
