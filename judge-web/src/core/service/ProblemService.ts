import { ProblemRepository } from "@/core/repository/ProblemRepository";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { AttachmentService } from "@/core/service/AttachmentService";

export class ProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly attachmentService: AttachmentService,
  ) {}

  findById(id: number) {
    return this.problemRepository.findById(id);
  }

  async createSubmission(id: number, input: CreateSubmissionInputDTO) {
    const attachment = await this.attachmentService.uploadAttachment(
      input.code,
    );
    return this.problemRepository.createSubmission(id, {
      ...input,
      code: attachment,
    });
  }
}
