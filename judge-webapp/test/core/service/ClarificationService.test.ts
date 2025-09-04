import { randomUUID } from "crypto";

import { mock } from "jest-mock-extended";

import { ClarificationRepository } from "@/core/repository/ClarificationRepository";
import { ClarificationService } from "@/core/service/ClarificationService";
import { MockCreateClarificationRequestDTO } from "@/test/mock/request/MockCreateClarificationRequestDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";

describe("ClarificationService", () => {
  const clarificationRepository = mock<ClarificationRepository>();

  const sut = new ClarificationService(clarificationRepository);

  const contestId = randomUUID();

  describe("createClarification", () => {
    it("should call clarificationRepository.create with the correct parameters", async () => {
      const inputDTO = MockCreateClarificationRequestDTO();
      const expectedResult = MockClarificationResponseDTO();
      clarificationRepository.createClarification.mockResolvedValue(
        expectedResult,
      );
      const result = await sut.createClarification(contestId, inputDTO);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("deleteById", () => {
    it("should call clarificationRepository.deleteById with the correct id", async () => {
      const clarificationId = randomUUID();
      await sut.deleteById(contestId, clarificationId);

      expect(clarificationRepository.deleteById).toHaveBeenCalledWith(
        contestId,
        clarificationId,
      );
    });
  });
});
