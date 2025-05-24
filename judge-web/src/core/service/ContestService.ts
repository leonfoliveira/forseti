import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { ContestOutputDTOMap } from "@/core/service/dto/output/ContestOutputDTO";
import { ContestShortOutputDTOMap } from "@/core/service/dto/output/ContestShortOutputDTO";

export class ContestService {
  constructor(
    private readonly contestRepository: ContestRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async createContest(input: CreateContestInputDTO) {
    const request = {
      ...input,
      problems: (await this.uploadTestCases(
        input.problems,
      )) as CreateContestRequestDTO["problems"],
    };
    const response = await this.contestRepository.createContest(request);
    return ContestOutputDTOMap.fromResponseDTO(response);
  }

  async updateContest(input: UpdateContestInputDTO) {
    const request = {
      ...input,
      problems: await this.uploadTestCases(input.problems),
    };
    const response = await this.contestRepository.updateContest(request);
    return ContestOutputDTOMap.fromResponseDTO(response);
  }

  async findAllContests() {
    const response = await this.contestRepository.findAllContests();
    return response.map(ContestShortOutputDTOMap.fromResponseDTO);
  }

  async findFullContestById(id: number) {
    const response = await this.contestRepository.findFullContestById(id);
    return ContestOutputDTOMap.fromResponseDTO(response);
  }

  async findContestById(id: number) {
    const response = await this.contestRepository.findContestById(id);
    return ContestShortOutputDTOMap.fromResponseDTO(response);
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

  private async uploadTestCases(
    problems: UpdateContestInputDTO["problems"],
  ): Promise<UpdateContestRequestDTO["problems"]> {
    return await Promise.all(
      problems.map(async (it) => {
        const testCases =
          it.testCases &&
          (await this.attachmentService.uploadAttachment(it.testCases));
        return { ...it, testCases };
      }),
    );
  }
}
