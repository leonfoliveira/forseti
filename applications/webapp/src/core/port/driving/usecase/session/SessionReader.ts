import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

export interface SessionReader {
  /**
   * Get the current session information.
   *
   * @return The current session or null if no session exists
   */
  getCurrent(): Promise<SessionResponseDTO | null>;
}
