import { v4 as uuidv4 } from "uuid";

import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";

export function MockClarificationResponseDTO(
  partial: Partial<ClarificationResponseDTO> = {},
): ClarificationResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    member: MockMemberPublicResponseDTO(),
    problem: MockProblemPublicResponseDTO(),
    parentId: uuidv4(),
    text: "Test clarification text",
    children: [],
    ...partial,
  };
}
