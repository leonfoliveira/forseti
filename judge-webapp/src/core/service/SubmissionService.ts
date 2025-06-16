import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { UpdateSubmissionAnswerRequestDTO } from "@/core/repository/dto/request/UpdateSubmissionAnswerRequestDTO";

export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly submissionListener: SubmissionListener,
  ) {}

  async findAllFullForMember(): Promise<SubmissionFullResponseDTO[]> {
    return await this.submissionRepository.findAllFullForMember();
  }

  async updateSubmissionAnswer(
    id: string,
    data: UpdateSubmissionAnswerRequestDTO,
  ): Promise<void> {
    return await this.submissionRepository.updateSubmissionAnswer(id, data);
  }

  async rerunSubmission(id: string): Promise<void> {
    return await this.submissionRepository.rerunSubmission(id);
  }

  subscribeForContest(
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<ListenerClient> {
    return this.submissionListener.subscribeForContest(contestId, cb);
  }

  subscribeForContestFull(
    contestId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ): Promise<ListenerClient> {
    return this.submissionListener.subscribeForContestFull(contestId, cb);
  }

  subscribeForMember(
    memberId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<ListenerClient> {
    return this.submissionListener.subscribeForMember(memberId, cb);
  }
}
