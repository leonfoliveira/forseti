import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";

export interface ContestRepository {
  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  findAllContestMetadata(): Promise<ContestMetadataResponseDTO[]>;

  findContestById(contestId: string): Promise<ContestPublicResponseDTO>;

  findContestMetadataBySlug(
    contestId: string,
  ): Promise<ContestMetadataResponseDTO>;

  findFullContestById(contestId: string): Promise<ContestFullResponseDTO>;

  forceStart(contestId: string): Promise<ContestMetadataResponseDTO>;

  forceEnd(contestId: string): Promise<ContestMetadataResponseDTO>;
}
