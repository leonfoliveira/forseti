import { ZonedDateTime } from "@internationalized/date";

import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Attachment } from "@/core/domain/model/Attachment";

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
    description: Attachment;
    newDescription?: File[];
    timeLimit: string;
    memoryLimit: string;
    testCases: Attachment;
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
