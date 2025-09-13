import { Authorization } from "@/core/domain/model/Authorization";

export interface AuthorizationRepository {
  getAuthorization(): Promise<Authorization>;
}
