import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

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

  forceStart(id: string): Promise<ContestMetadataResponseDTO>;

  forceEnd(id: string): Promise<ContestMetadataResponseDTO>;

  deleteContest(id: string): Promise<void>;

  findAllContestSubmissions(id: string): Promise<SubmissionPublicResponseDTO[]>;

  findAllContestFullSubmissions(
    id: string,
  ): Promise<SubmissionFullResponseDTO[]>;

  createAnnouncement(
    id: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO>;

  createClarification(
    id: string,
    requestDTO: CreateClarificationRequestDTO,
  ): Promise<ClarificationResponseDTO>;
}
