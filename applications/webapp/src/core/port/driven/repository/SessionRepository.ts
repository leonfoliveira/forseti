import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

export interface SessionRepository {
  getSession(): Promise<SessionResponseDTO>;

  deleteSession(): Promise<void>;
}
