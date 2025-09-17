import { SessionResponseDTO } from "@/core/repository/dto/response/session/SessionResponseDTO";

export interface SessionRepository {
  getSession(): Promise<SessionResponseDTO>;

  deleteSession(): Promise<void>;
}
