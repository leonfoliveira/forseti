import { v4 as uuidv4 } from "uuid";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { UpdateContestRequestDTO } from "@/core/port/dto/request/UpdateContestRequestDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";

export function MockUpdateContestRequestDTO(
  partial: Partial<UpdateContestRequestDTO> = {},
): UpdateContestRequestDTO {
  return {
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
        color: "#ffffff",
        title: "Test Problem",
        description: MockAttachmentResponseDTO({
          filename: "problem.pdf",
          contentType: "application/pdf",
        }),
        timeLimit: 1000,
        memoryLimit: 256,
        testCases: MockAttachmentResponseDTO({
          filename: "testcases.csv",
          contentType: "text/csv",
        }),
      },
    ],
    ...partial,
  };
}
