import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export interface AuthenticationRepository {
  getAuthorization(accessToken: string): Promise<Authorization>;

  authenticate(requestDTO: AuthenticateRequestDTO): Promise<Authorization>;
}
