import { PrintRequestWriter } from "@/port/input/usecase/printRequest/PrintRequestWriter";
import { CreatePrintRequestRequestDTO } from "@/port/dto/request/printRequest/CreatePrintRequestRequestDTO";
import { UpdateStatusPrintRequestRequestDTO } from "@/port/dto/request/printRequest/UpdateStatusPrintRequestRequestDTO";
import { PrintRequestRepository } from "@/port/output/repository/PrintRequestRepository";

export class PrintRequestService implements PrintRequestWriter {
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
