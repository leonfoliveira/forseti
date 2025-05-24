import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";

export type ContestOutputDTO = ContestResponseDTO & {
  status: ContestStatus;
};

export const ContestOutputDTOMap = {
  fromResponseDTO(response: ContestResponseDTO): ContestOutputDTO {
    return {
      ...response,
      status: getContestStatus(response),
    };
  },
};
