import { randomUUID } from "crypto";

import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export function MockAuthenticateRequestDTO(
  partial: Partial<AuthenticateRequestDTO> = {},
): AuthenticateRequestDTO {
  return {
    contestId: randomUUID(),
    login: "test-login",
    password: "test-password",
    ...partial,
  };
}
