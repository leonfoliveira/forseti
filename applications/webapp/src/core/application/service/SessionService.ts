import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { SessionRepository } from "@/core/port/driven/repository/SessionRepository";
import { SessionReader } from "@/core/port/driving/usecase/session/SessionReader";
import { SessionWritter } from "@/core/port/driving/usecase/session/SessionWritter";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

export class SessionService implements SessionReader, SessionWritter {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async getCurrent(): Promise<SessionResponseDTO | null> {
    try {
      return await this.sessionRepository.getCurrent();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return null;
      }
      throw error;
    }
  }

  async deleteCurrent(): Promise<void> {
    await this.sessionRepository.deleteCurrent();
  }
}
