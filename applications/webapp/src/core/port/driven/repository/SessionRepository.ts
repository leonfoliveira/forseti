import { SessionResponseDTO } from "@/core/port/driven/repository/dto/response/session/SessionResponseDTO";

export interface SessionRepository {
  getSession(): Promise<SessionResponseDTO>;

  deleteSession(): Promise<void>;
}
