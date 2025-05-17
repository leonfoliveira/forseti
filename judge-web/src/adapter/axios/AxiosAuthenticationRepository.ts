import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthorizationResponseDTO } from "@/core/repository/dto/response/AuthorizationResponseDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  authenticateMember(
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<AuthorizationResponseDTO> {
    return this.axiosClient.post<AuthorizationResponseDTO>(
      "/v1/auth/member",
      requestDTO,
    );
  }

  authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<AuthorizationResponseDTO> {
    return this.axiosClient.post<AuthorizationResponseDTO>(
      "/v1/auth/root",
      requestDTO,
    );
  }
}
