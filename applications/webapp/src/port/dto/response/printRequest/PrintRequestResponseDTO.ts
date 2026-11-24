import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type PrintRequestResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  submission: SubmissionWithCodeResponseDTO;
  status: PrintRequestStatus;
};
