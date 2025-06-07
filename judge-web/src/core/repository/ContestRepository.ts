import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";

export interface ContestRepository {
  createContest(
    requestDTO: CreateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  updateContest(
    requestDTO: UpdateContestRequestDTO,
  ): Promise<ContestFullResponseDTO>;

  findAllContestMetadata(): Promise<ContestMetadataResponseDTO[]>;

  findContestById(id: string): Promise<ContestResponseDTO>;

  findContestMetadataById(id: string): Promise<ContestMetadataResponseDTO>;

  findFullContestById(id: string): Promise<ContestFullResponseDTO>;

  deleteContest(id: string): Promise<void>;

  findAllContestSubmissions(id: string): Promise<SubmissionPublicResponseDTO[]>;

  findAllContestFullSubmissions(
    id: string,
  ): Promise<SubmissionFullResponseDTO[]>;
}
