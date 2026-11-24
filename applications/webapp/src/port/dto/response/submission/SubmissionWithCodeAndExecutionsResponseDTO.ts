import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ExecutionResponseDTO } from "@/port/dto/response/execution/ExecutionResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export type SubmissionWithCodeAndExecutionsResponseDTO =
  SubmissionResponseDTO & {
    code: AttachmentResponseDTO;
    executions: ExecutionResponseDTO[];
  };
