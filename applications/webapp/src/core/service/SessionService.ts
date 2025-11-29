import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { SessionResponseDTO } from "@/core/port/driven/repository/dto/response/session/SessionResponseDTO";
import { SessionRepository } from "@/core/port/driven/repository/SessionRepository";

export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async getSession(): Promise<SessionResponseDTO | null> {
    try {
      return await this.sessionRepository.getSession();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return null;
      }
      throw error;
    }
  }

  async deleteSession(): Promise<void> {
    await this.sessionRepository.deleteSession();
  }
}
