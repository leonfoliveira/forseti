import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { getContestStatus } from "@/app/_util/contest-utils";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

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
