import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";
import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";

export type ContestShortOutputDTO = ContestShortResponseDTO & {
  status: ContestStatus;
};

export const ContestShortOutputDTOMap = {
  fromResponseDTO(response: ContestShortResponseDTO): ContestShortOutputDTO {
    return {
      ...response,
      status: getContestStatus(response),
    };
  },
};
