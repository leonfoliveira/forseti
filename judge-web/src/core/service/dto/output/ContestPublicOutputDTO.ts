import { getContestStatus } from "@/app/_util/contest-utils";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/ContestPublicResponseDTO";

export type ContestPublicOutputDTO = ContestPublicResponseDTO & {
  status: ContestStatus;
};

export const ContestPublicOutputDTOMap = {
  fromResponseDTO(response: ContestPublicResponseDTO): ContestPublicOutputDTO {
    return {
      ...response,
      status: getContestStatus(response),
    };
  },
};
