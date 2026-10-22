import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { PrintRequestService } from "@/service/PrintRequestService";
import { PrintRequestRepository } from "@/port/output/repository/PrintRequestRepository";
import {
  MockCreatePrintRequestRequestDTO,
  MockUpdateStatusPrintRequestRequestDTO,
  MockPrintRequestResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("PrintRequestService", () => {
  const printRequestRepository = mock<PrintRequestRepository>();

  const sut = new PrintRequestService(printRequestRepository);

  const contestId = uuidv4();

  describe("create", () => {
    it("should call printRequestRepository.create with the correct parameters", async () => {
      const inputDTO = MockCreatePrintRequestRequestDTO();
      const expectedResult = MockPrintRequestResponseDTO();
      printRequestRepository.create.mockResolvedValue(expectedResult);
      const result = await sut.create(contestId, inputDTO);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("updateStatus", () => {
    it("should call printRequestRepository.updateStatus with the correct parameters", async () => {
      const printRequestId = uuidv4();
      const inputDTO = MockUpdateStatusPrintRequestRequestDTO();
      const expectedResult = MockPrintRequestResponseDTO();
      printRequestRepository.updateStatus.mockResolvedValue(expectedResult);
      const result = await sut.updateStatus(
        contestId,
        printRequestId,
        inputDTO,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
