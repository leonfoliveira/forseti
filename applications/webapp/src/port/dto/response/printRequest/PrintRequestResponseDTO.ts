import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

export type PrintRequestResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  submission: SubmissionWithCodeResponseDTO;
  status: PrintRequestStatus;
};
