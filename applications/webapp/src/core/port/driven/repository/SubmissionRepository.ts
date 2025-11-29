import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { CreateSubmissionRequestDTO } from "@/core/port/dto/request/CreateSubmissionRequestDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

export interface SubmissionRepository {
  createSubmission(
    contestId: string,
    request: CreateSubmissionRequestDTO,
  ): Promise<SubmissionFullResponseDTO>;

  findAllContestSubmissions(
    contestId: string,
  ): Promise<SubmissionPublicResponseDTO[]>;

  findAllContestFullSubmissions(
    contestId: string,
  ): Promise<SubmissionFullResponseDTO[]>;

  findAllFullForMember(contestId: string): Promise<SubmissionFullResponseDTO[]>;

  updateSubmissionAnswer(
    contestId: string,
    submissionId: string,
    answer: SubmissionAnswer,
  ): Promise<void>;

  rerunSubmission(contestId: string, submissionId: string): Promise<void>;
}
