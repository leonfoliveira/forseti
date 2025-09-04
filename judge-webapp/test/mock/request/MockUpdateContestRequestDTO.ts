import { randomUUID } from "crypto";

import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockUpdateContestRequestDTO(
  partial: Partial<UpdateContestRequestDTO> = {},
): UpdateContestRequestDTO {
  return {
    id: randomUUID(),
    slug: "test-contest",
    title: "Test Contest",
    languages: [Language.CPP_17, Language.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    members: [
      {
        id: randomUUID(),
        type: MemberType.CONTESTANT,
        name: "Test User",
        login: "testuser",
        password: "password123",
      },
    ],
    problems: [
      {
        id: randomUUID(),
        letter: "A",
        title: "Test Problem",
        description: MockAttachment({
          filename: "problem.pdf",
          contentType: "application/pdf",
        }),
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: MockAttachment({
          filename: "testcases.csv",
          contentType: "text/csv",
        }),
      },
    ],
    ...partial,
  };
}
