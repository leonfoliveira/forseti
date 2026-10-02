import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";
import { SessionService } from "@/service/SessionService";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("SessionService", () => {
  it("returns the current session when the repository resolves", async () => {
    const session = MockSessionResponseDTO();
    const repository = {
      getCurrent: jest.fn().mockResolvedValue(session),
      deleteCurrent: jest.fn(),
    };
    const service = new SessionService(repository);

    await expect(service.getCurrent()).resolves.toBe(session);
  });

  it("returns null when the user is unauthorized", async () => {
    const repository = {
      getCurrent: jest
        .fn()
        .mockRejectedValue(new UnauthorizedException("not signed in")),
      deleteCurrent: jest.fn(),
    };
    const service = new SessionService(repository);

    await expect(service.getCurrent()).resolves.toBeNull();
  });

  it("propagates other errors and delegates session deletion", async () => {
    const error = new Error("request failed");
    const repository = {
      getCurrent: jest.fn().mockRejectedValue(error),
      deleteCurrent: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SessionService(repository);

    await expect(service.getCurrent()).rejects.toBe(error);
    await expect(service.deleteCurrent()).resolves.toBeUndefined();
    expect(repository.deleteCurrent).toHaveBeenCalled();
  });
});
