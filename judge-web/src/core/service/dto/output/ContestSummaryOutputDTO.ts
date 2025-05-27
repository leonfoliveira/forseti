import { ContestStatus, getContestStatus } from "@/app/_util/contest-utils";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";

export type ContestSummaryOutputDTO = ContestSummaryResponseDTO & {
  status: ContestStatus;
};

export const ContestSummaryOutputDTOMap = {
  fromResponseDTO(
    response: ContestSummaryResponseDTO,
  ): ContestSummaryOutputDTO {
    return {
      ...response,
      status: getContestStatus(response),
    };
  },
};
