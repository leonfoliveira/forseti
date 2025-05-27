import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { AttachmentService } from "@/core/service/AttachmentService";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { CompatClient } from "@stomp/stompjs";

export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly submissionListener: StompSubmissionListener,
    private readonly attachmentService: AttachmentService,
  ) {}

  async findAllForMember(): Promise<SubmissionPrivateResponseDTO[]> {
    return this.submissionRepository.findAllForMember();
  }

  async createSubmission(input: CreateSubmissionInputDTO) {
    const attachment = await this.attachmentService.upload(input.code);
    return this.submissionRepository.createSubmission({
      problemId: input.problemId,
      language: input.language,
      code: attachment,
    });
  }

  subscribeForContest(
    contestId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<CompatClient> {
    return this.submissionListener.subscribeForContest(contestId, cb);
  }

  subscribeForMember(
    memberId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<CompatClient> {
    return this.submissionListener.subscribeForMember(memberId, cb);
  }

  unsubscribe(client: CompatClient): Promise<void> {
    return this.submissionListener.unsubscribe(client);
  }
}
