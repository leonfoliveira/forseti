import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export interface ContestRepository {
  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  findAllContestMetadata(): Promise<ContestMetadataResponseDTO[]>;

  findContestById(id: string): Promise<ContestPublicResponseDTO>;

  findContestMetadataBySlug(id: string): Promise<ContestMetadataResponseDTO>;

  findFullContestById(id: string): Promise<ContestFullResponseDTO>;

  findContestLeaderboardById(
    id: string,
  ): Promise<ContestLeaderboardResponseDTO>;

  deleteContest(id: string): Promise<void>;

  findAllContestSubmissions(id: string): Promise<SubmissionPublicResponseDTO[]>;

  findAllContestFullSubmissions(
    id: string,
  ): Promise<SubmissionFullResponseDTO[]>;
}
