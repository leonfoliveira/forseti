import { ZonedDateTime } from "@internationalized/date";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type SettingsForm = {
  slug: string;
  title: string;
  languages: SubmissionLanguage[];
  startAt: string;
  endAt: string;
  settings: {
    isAutoJudgeEnabled: boolean;
  };
  problems: {
    _id?: string;
    title: string;
    description: AttachmentResponseDTO;
    newDescription?: File[];
    timeLimit: string;
    memoryLimit: string;
    testCases: AttachmentResponseDTO;
    newTestCases?: File[];
  }[];
  members: {
    _id?: string;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
  }[];
};
