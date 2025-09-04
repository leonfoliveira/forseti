import { randomUUID } from "crypto";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Authorization } from "@/core/domain/model/Authorization";

export function MockAuthorization(
  partial: Partial<Authorization> = {},
): Authorization {
  return {
    member: {
      id: randomUUID(),
      contestId: randomUUID(),
      name: "test-name",
      type: MemberType.CONTESTANT,
    },
    expiresAt: "2025-01-01T00:00:00Z",
    ...partial,
  };
}
