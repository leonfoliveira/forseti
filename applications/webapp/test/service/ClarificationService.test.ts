import { ClarificationService } from "@/service/ClarificationService";
import { MockClarificationResponseDTO } from "@/test/mock/response/MockDTOs";

describe("ClarificationService", () => {
  it("should create a clarification", async () => {
    const clarification = MockClarificationResponseDTO();
    const repository = {
      create: jest.fn().mockResolvedValue(clarification),
    };
    const service = new ClarificationService(repository as never);

    const result = await service.create("contest-1", clarification);

    expect(repository.create).toHaveBeenCalledWith("contest-1", clarification);
    expect(result).toEqual(clarification);
  });

  it("should answer a clarification", async () => {
    const clarification = MockClarificationResponseDTO();
    const repository = {
      answer: jest.fn().mockResolvedValue(clarification),
    };
    const service = new ClarificationService(repository as never);

    const result = await service.answer(
      "contest-1",
      "clarification-1",
      clarification,
    );

    expect(repository.answer).toHaveBeenCalledWith(
      "contest-1",
      "clarification-1",
      clarification,
    );
    expect(result).toEqual(clarification);
  });

  it("should publish a clarification", async () => {
    const clarification = MockClarificationResponseDTO();
    const repository = {
      publish: jest.fn().mockResolvedValue(clarification),
    };
    const service = new ClarificationService(repository as never);

    const result = await service.publish("contest-1", "clarification-1");

    expect(repository.publish).toHaveBeenCalledWith(
      "contest-1",
      "clarification-1",
    );
    expect(result).toEqual(clarification);
  });
});
