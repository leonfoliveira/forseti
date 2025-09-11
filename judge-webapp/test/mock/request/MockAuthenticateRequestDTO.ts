import { v4 as uuidv4 } from "uuid";

import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export function MockAuthenticateRequestDTO(
  partial: Partial<AuthenticateRequestDTO> = {},
): AuthenticateRequestDTO {
  return {
    contestId: uuidv4(),
    login: "test-login",
    password: "test-password",
    ...partial,
  };
}
