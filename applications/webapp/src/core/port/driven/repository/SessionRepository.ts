import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

export interface SessionRepository {
  /**
   * Get the current session.
   *
   * @returns The session data
   */
  getCurrent(): Promise<SessionResponseDTO>;

  /**
   * Delete the current session.
   */
  deleteCurrent(): Promise<void>;
}
