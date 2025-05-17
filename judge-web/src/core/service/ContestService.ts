import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";

export class ContestService {
  constructor(private readonly contestRepository: ContestRepository) {}

  createContest(inputDTO: CreateContestRequestDTO) {
    return this.contestRepository.createContest(inputDTO);
  }

  updateContest(inputDTO: UpdateContestRequestDTO) {
    return this.contestRepository.updateContest(inputDTO);
  }

  findAllContests() {
    return this.contestRepository.findAllContests();
  }

  findFullContestById(id: number) {
    return this.contestRepository.findFullContestById(id);
  }

  findContestById(id: number) {
    return this.contestRepository.findContestById(id);
  }

  deleteContest(id: number) {
    return this.contestRepository.deleteContest(id);
  }

  findById(id: number) {
    return this.contestRepository.findContestById(id);
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
}
