import { MockClarificationResponseDTO } from "@/test/mock/response/MockDTOs";
import { AxiosClarificationRepository } from "@/infrastructure/axios/repository/AxiosClarificationRepository";

describe("AxiosClarificationRepository", () => {
  it("should create a clarification", async () => {
    const clarification = MockClarificationResponseDTO();
    const client = {
      post: jest.fn().mockResolvedValue({ data: clarification }),
    };
    const repository = new AxiosClarificationRepository(client as never);

    await repository.create("contest-1", clarification);

    expect(client.post).toHaveBeenCalledWith(
      "/v1/contests/contest-1/clarifications",
      { data: clarification },
    );
  });

  it("should answer a clarification", async () => {
    const clarification = MockClarificationResponseDTO();
    const client = {
      patch: jest.fn().mockResolvedValue({ data: clarification }),
    };
    const repository = new AxiosClarificationRepository(client as never);

    await repository.answer("contest-1", clarification.id, clarification);

    expect(client.patch).toHaveBeenCalledWith(
      `/v1/contests/contest-1/clarifications/${clarification.id}/answer`,
      { data: clarification },
    );
  });

  it("should publish a clarification", async () => {
    const clarification = MockClarificationResponseDTO();
    const client = {
      patch: jest.fn().mockResolvedValue({ data: clarification }),
    };
    const repository = new AxiosClarificationRepository(client as never);

    await repository.publish("contest-1", clarification.id);

    expect(client.patch).toHaveBeenCalledWith(
      `/v1/contests/contest-1/clarifications/${clarification.id}/publish`,
    );
  });
});
