import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";
import { SessionRepository } from "@/port/output/repository/SessionRepository";
import { SessionReader } from "@/port/input/usecase/session/SessionReader";
import { SessionWritter } from "@/port/input/usecase/session/SessionWritter";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

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
