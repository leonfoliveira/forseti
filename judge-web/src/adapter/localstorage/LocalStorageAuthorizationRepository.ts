import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { Authorization } from "@/core/domain/model/Authorization";

export class LocalStorageAuthorizationRepository
  implements AuthorizationRepository
{
  setAuthorization(authorization: Authorization): void {
    localStorage.setItem("authorization", JSON.stringify(authorization));
  }

  getAuthorization(): Authorization | null {
    const authorization = localStorage.getItem("authorization");
    if (authorization) {
      return JSON.parse(authorization) as Authorization;
    }
    return null;
  }

  deleteAuthorization(): void {
    localStorage.removeItem("authorization");
  }
}
