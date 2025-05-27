import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";

export type ContestOutputDTO = ContestPrivateResponseDTO & {
  status: ContestStatus;
};

export const ContestOutputDTOMap = {
  fromResponseDTO(response: ContestPrivateResponseDTO): ContestOutputDTO {
    return {
      ...response,
      status: getContestStatus(response),
    };
  },
};
