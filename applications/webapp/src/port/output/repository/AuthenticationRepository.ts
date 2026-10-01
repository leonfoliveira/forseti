import { AuthenticateRequestDTO } from "@/port/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

export interface AuthenticationRepository {
  /**
   * Authenticate a user for a specific contest.
   *
   * @param contestId ID of the contest
   * @param requestDTO Authentication request data
   * @returns The session data
   */
  authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO>;
}
