import { Authorization } from "@/core/domain/model/Authorization";

export interface AuthorizationRepository {
  setAuthorization(authorization: Authorization): void;

  getAuthorization(): Authorization | null;

  deleteAuthorization(): void;
}
