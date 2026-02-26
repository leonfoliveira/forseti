import { ExecutionResponseDTO } from "@/core/port/dto/response/execution/ExecutionResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type SubmissionWithCodeAndExecutionsResponseDTO =
  SubmissionWithCodeResponseDTO & {
    executions: ExecutionResponseDTO[];
  };
