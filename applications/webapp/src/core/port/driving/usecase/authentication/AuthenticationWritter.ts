import { AuthenticateRequestDTO } from "@/core/port/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

export interface AuthenticationWritter {
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
