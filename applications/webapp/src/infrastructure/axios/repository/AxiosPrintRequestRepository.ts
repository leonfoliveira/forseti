import { AxiosClient } from "@/infrastructure/axios/AxiosClient";
import { CreatePrintRequestRequestDTO } from "@/port/dto/request/printRequest/CreatePrintRequestRequestDTO";
import { UpdateStatusPrintRequestRequestDTO } from "@/port/dto/request/printRequest/UpdateStatusPrintRequestRequestDTO";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { PrintRequestRepository } from "@/port/output/repository/PrintRequestRepository";

export class AxiosPrintRequestRepository implements PrintRequestRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/print-requests`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    requestDTO: CreatePrintRequestRequestDTO,
  ): Promise<PrintRequestResponseDTO> {
    const response = await this.axiosClient.post<PrintRequestResponseDTO>(
      this.basePath(contestId),
      { data: requestDTO },
    );
    return response.data;
  }

  async updateStatus(
    contestId: string,
    printRequestId: string,
    requestDTO: UpdateStatusPrintRequestRequestDTO,
  ): Promise<PrintRequestResponseDTO> {
    const response = await this.axiosClient.patch<PrintRequestResponseDTO>(
      `${this.basePath(contestId)}/${printRequestId}/status`,
      { data: requestDTO },
    );
    return response.data;
  }
}
