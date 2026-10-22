import { PrintRequestWritter } from "@/port/input/usecase/printRequest/PrintRequestWritter";
import { CreatePrintRequestRequestDTO } from "@/port/dto/request/printRequest/CreatePrintRequestRequestDTO";
import { UpdateStatusPrintRequestRequestDTO } from "@/port/dto/request/printRequest/UpdateStatusPrintRequestRequestDTO";
import { PrintRequestRepository } from "@/port/output/repository/PrintRequestRepository";

export class PrintRequestService implements PrintRequestWritter {
  constructor(
    private readonly printRequestRepository: PrintRequestRepository,
  ) {}

  async create(contestId: string, requestDTO: CreatePrintRequestRequestDTO) {
    return this.printRequestRepository.create(contestId, requestDTO);
  }

  async updateStatus(
    contestId: string,
    printRequestId: string,
    requestDTO: UpdateStatusPrintRequestRequestDTO,
  ) {
    return this.printRequestRepository.updateStatus(
      contestId,
      printRequestId,
      requestDTO,
    );
  }
}
