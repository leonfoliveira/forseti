import { mock } from "jest-mock-extended";

import { SessionService } from "@/core/application/service/SessionService";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { SessionRepository } from "@/core/port/driven/repository/SessionRepository";
import { MockSession } from "@/test/mock/response/session/MockSession";

describe("SessionService", () => {
  const sessionRepository = mock<SessionRepository>();

  const sut = new SessionService(sessionRepository);

  describe("getSession", () => {
    it("should call sessionRepository.getSession", async () => {
      const session = MockSession();
      sessionRepository.getCurrent.mockResolvedValue(session);

      const result = await sut.getCurrent();

      expect(sessionRepository.getCurrent).toHaveBeenCalled();
      expect(result).toEqual(session);
    });

    it("should return null if UnauthorizedException is thrown", async () => {
      sessionRepository.getCurrent.mockRejectedValue(
        new UnauthorizedException("Unauthorized"),
      );

      const result = await sut.getCurrent();

      expect(result).toBeNull();
    });
  });

  describe("deleteCurrent", () => {
    it("should call sessionRepository.deleteSession", async () => {
      await sut.deleteCurrent();

      expect(sessionRepository.deleteCurrent).toHaveBeenCalled();
    });
  });
});
