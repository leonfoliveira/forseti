import { getContestStatus } from "@/app/_util/contest-utils";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";

export type ContestSummaryOutputDTO = ContestSummaryResponseDTO & {
  status: ContestStatus;
};

export const ContestSummaryOutputDTOMap = {
  fromResponseDTO(
    response: ContestSummaryResponseDTO
  ): ContestSummaryOutputDTO {
    return {
      ...response,
      status: getContestStatus(response),
    };
  },
};
