import {
  MockPrintRequestResponseDTO,
  MockCreatePrintRequestRequestDTO,
  MockUpdateStatusPrintRequestRequestDTO,
} from "@/test/mock/response/MockDTOs";
import { AxiosPrintRequestRepository } from "@/infrastructure/axios/repository/AxiosPrintRequestRepository";

describe("AxiosPrintRequestRepository", () => {
  it("creates a print request", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    const client = {
      post: jest.fn().mockResolvedValue({ data: printRequest }),
    };
    const repository = new AxiosPrintRequestRepository(client as never);
    const request = MockCreatePrintRequestRequestDTO();

    await repository.create("contest-1", request);

    expect(client.post).toHaveBeenCalledWith(
      "/v1/contests/contest-1/print-requests",
      { data: request },
    );
  });

  it("updates the status of a print request", async () => {
    const printRequest = MockPrintRequestResponseDTO();
    const client = {
      patch: jest.fn().mockResolvedValue({ data: printRequest }),
    };
    const repository = new AxiosPrintRequestRepository(client as never);
    const request = MockUpdateStatusPrintRequestRequestDTO();

    await repository.updateStatus("contest-1", "print-request-1", request);

    expect(client.patch).toHaveBeenCalledWith(
      "/v1/contests/contest-1/print-requests/print-request-1/status",
      { data: request },
    );
  });
});
