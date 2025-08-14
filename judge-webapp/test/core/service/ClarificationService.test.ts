import { mock } from "jest-mock-extended";

import { ClarificationRepository } from "@/core/repository/ClarificationRepository";
import { ClarificationService } from "@/core/service/ClarificationService";

describe("ClarificationService", () => {
  const clarificationRepository = mock<ClarificationRepository>();

  const sut = new ClarificationService(clarificationRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("deleteById", () => {
    it("should call clarificationRepository.deleteById with the correct id", async () => {
      const id = "123";

      await sut.deleteById(id);

      expect(clarificationRepository.deleteById).toHaveBeenCalledWith(id);
    });
  });
});
