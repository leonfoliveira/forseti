import { mock } from "jest-mock-extended";

import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { SessionRepository } from "@/core/port/driven/repository/SessionRepository";
import { SessionService } from "@/core/service/SessionService";
import { MockSession } from "@/test/mock/response/session/MockSession";

describe("SessionService", () => {
  const sessionRepository = mock<SessionRepository>();

  const sut = new SessionService(sessionRepository);

  describe("getSession", () => {
    it("should call sessionRepository.getSession", async () => {
      const session = MockSession();
      sessionRepository.getSession.mockResolvedValue(session);

      const result = await sut.getSession();

      expect(sessionRepository.getSession).toHaveBeenCalled();
      expect(result).toEqual(session);
    });

    it("should return null if UnauthorizedException is thrown", async () => {
      sessionRepository.getSession.mockRejectedValue(
        new UnauthorizedException("Unauthorized"),
      );

      const result = await sut.getSession();

      expect(result).toBeNull();
    });
  });

  describe("cleanSession", () => {
    it("should call sessionRepository.deleteSession", async () => {
      await sut.deleteSession();

      expect(sessionRepository.deleteSession).toHaveBeenCalled();
    });
  });
});
