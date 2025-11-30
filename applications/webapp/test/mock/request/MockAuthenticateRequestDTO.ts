import { AuthenticateRequestDTO } from "@/core/port/dto/request/AuthenticateRequestDTO";

export function MockAuthenticateRequestDTO(
  partial: Partial<AuthenticateRequestDTO> = {},
): AuthenticateRequestDTO {
  return {
    login: "test-login",
    password: "test-password",
    ...partial,
  };
}
