import { ProblemRepository } from "@/core/repository/ProblemRepository";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";

export class ProblemService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  findById(id: number) {
    return this.problemRepository.findById(id);
  }

  createSubmission(id: number, requestDTO: CreateSubmissionRequestDTO) {
    return this.problemRepository.createSubmission(id, requestDTO);
  }
}
