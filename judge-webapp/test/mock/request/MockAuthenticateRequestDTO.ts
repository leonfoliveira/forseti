import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export function MockAuthenticateRequestDTO(
  partial: Partial<AuthenticateRequestDTO> = {},
): AuthenticateRequestDTO {
  return {
    login: "test-login",
    password: "test-password",
    ...partial,
  };
}
