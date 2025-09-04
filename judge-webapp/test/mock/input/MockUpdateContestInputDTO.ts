import { randomUUID } from "crypto";

import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockUpdateContestInputDTO(
  partial: Partial<UpdateContestInputDTO> = {},
): UpdateContestInputDTO {
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
        newDescription: new File(
          ["# Problem A\n\nThis is a test problem."],
          "problem.md",
          {
            type: "text/markdown",
          },
        ),
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: MockAttachment({
          filename: "testcases.csv",
          contentType: "text/csv",
        }),
        newTestCases: new File(["input,output\n1,1\n2,2"], "testcases.csv", {
          type: "text/csv",
        }),
      },
    ],
    ...partial,
  };
}
