import { v4 as uuidv4 } from "uuid";

import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";

export function MockClarificationResponseDTO(
  partial: Partial<ClarificationResponseDTO> = {},
): ClarificationResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    member: MockMemberResponseDTO(),
    problem: MockProblemResponseDTO(),
    parentId: uuidv4(),
    text: "Test clarification text",
    children: [],
    version: 1,
    ...partial,
  };
}
