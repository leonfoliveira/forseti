import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

export type UpdateStatusPrintRequestRequestDTO = {
  status: PrintRequestStatus;
};
