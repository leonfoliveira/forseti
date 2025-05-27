import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";
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
