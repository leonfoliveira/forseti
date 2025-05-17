import { AuthorizationResponseDTO } from "@/core/repository/dto/response/AuthorizationResponseDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";

export interface AuthenticationRepository {
  authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<AuthorizationResponseDTO>;

  authenticateMember(
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<AuthorizationResponseDTO>;
}
