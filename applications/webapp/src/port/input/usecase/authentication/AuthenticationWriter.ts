import { AuthenticateRequestDTO } from "@/port/dto/request/authentication/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

export interface AuthenticationWriter {
  /**
   * Authenticate a user for a contest.
   *
   * @param contestId ID of the contest
   * @param requestDTO Data for authentication
   * @return The session information
   */
  authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO>;
}
