import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { ProblemRepository } from "@/core/repository/ProblemRepository";

export class ProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  async createSubmission(id: string, input: CreateSubmissionInputDTO) {
    const attachment = await this.attachmentService.upload(input.code);
    return await this.problemRepository.createSubmission(id, {
      language: input.language,
      code: attachment,
    });
  }
}
