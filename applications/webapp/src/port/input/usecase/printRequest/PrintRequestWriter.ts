import { CreatePrintRequestRequestDTO } from "@/port/dto/request/printRequest/CreatePrintRequestRequestDTO";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { UpdateStatusPrintRequestRequestDTO } from "@/port/dto/request/printRequest/UpdateStatusPrintRequestRequestDTO";

export interface PrintRequestWriter {
  /**
   * Creates a new print request for a given contest.
   *
   * @param contestId The ID of the contest for which the print request is being created.
   * @param requestDTO The data transfer object containing the details of the print request.
   * @returns A promise that resolves to the created print request response DTO.
   */
  create(
    contestId: string,
    requestDTO: CreatePrintRequestRequestDTO,
  ): Promise<PrintRequestResponseDTO>;

  /**
   * Updates the status of an existing print request for a given contest.
   *
   * @param contestId The ID of the contest to which the print request belongs.
   * @param printRequestId The ID of the print request to be updated.
   * @param requestDTO The data transfer object containing the new status of the print request.
   * @returns A promise that resolves to the updated print request response DTO.
   */
  updateStatus(
    contestId: string,
    printRequestId: string,
    requestDTO: UpdateStatusPrintRequestRequestDTO,
  ): Promise<PrintRequestResponseDTO>;
}
