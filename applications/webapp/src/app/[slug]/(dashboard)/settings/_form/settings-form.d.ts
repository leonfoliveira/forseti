import { ZonedDateTime } from "@internationalized/date";

import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type SettingsForm = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: ZonedDateTime;
  endAt: ZonedDateTime;
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
