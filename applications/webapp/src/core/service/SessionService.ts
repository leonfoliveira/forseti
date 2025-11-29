import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { SessionRepository } from "@/core/port/driven/repository/SessionRepository";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

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
