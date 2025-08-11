import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";

export interface AuthenticationRepository {
  getAuthorization(): Promise<Authorization>;

  cleanAuthorization(): Promise<void>;

  authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO
  ): Promise<Authorization>;

  authenticateMember(
    contestId: string,
    requestDTO: AuthenticateMemberRequestDTO
  ): Promise<Authorization>;
}
