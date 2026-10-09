import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { ExecutionResponseDTO } from "@/port/dto/response/execution/ExecutionResponseDTO";

export type SubmissionWithCodeAndExecutionsResponseDTO =
  SubmissionResponseDTO & {
    code: AttachmentResponseDTO;
    executions: ExecutionResponseDTO[];
  };
