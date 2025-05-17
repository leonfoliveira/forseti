import { Authorization } from "@/core/domain/model/Authorization";

export interface AuthorizationRepository {
  setAuthorization(accessToken: string): void;

  getAccessToken(): string | null;

  getAuthorization(): Authorization | null;

  deleteAuthorization(): void;
}
