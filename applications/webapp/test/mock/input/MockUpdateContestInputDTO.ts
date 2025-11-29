import { v4 as uuidv4 } from "uuid";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { UpdateContestInputDTO } from "@/core/port/driving/usecase/contest/ContestWritter";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";

export function MockUpdateContestInputDTO(
  partial: Partial<UpdateContestInputDTO> = {},
): UpdateContestInputDTO {
  return {
    id: uuidv4(),
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    settings: {
      isAutoJudgeEnabled: false,
    },
    members: [
      {
        id: uuidv4(),
        type: MemberType.CONTESTANT,
        name: "Test User",
        login: "testuser",
        password: "password123",
      },
    ],
    problems: [
      {
        id: uuidv4(),
        letter: "A",
        title: "Test Problem",
        description: MockAttachmentResponseDTO({
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
        testCases: MockAttachmentResponseDTO({
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
