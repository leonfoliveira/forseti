import { Authorization } from "@/core/domain/model/Authorization";

export type AuthorizationResponseDTO = {
  authorization: Authorization;
  token: string;
};
