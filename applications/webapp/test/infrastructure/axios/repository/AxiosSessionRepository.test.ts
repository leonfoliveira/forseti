import { AxiosSessionRepository } from "@/infrastructure/axios/repository/AxiosSessionRepository";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("AxiosSessionRepository", () => {
  it("gets the current session", async () => {
    const session = MockSessionResponseDTO();
    const client = { get: jest.fn().mockResolvedValue({ data: session }) };
    const repository = new AxiosSessionRepository(client as never);

    await expect(repository.getCurrent()).resolves.toBe(session);
    expect(client.get).toHaveBeenCalledWith("/v1/sessions/me");
  });

  it("deletes the current session", async () => {
    const client = { delete: jest.fn().mockResolvedValue(undefined) };
    const repository = new AxiosSessionRepository(client as never);

    await expect(repository.deleteCurrent()).resolves.toBeUndefined();
    expect(client.delete).toHaveBeenCalledWith("/v1/sessions/me");
  });
});
