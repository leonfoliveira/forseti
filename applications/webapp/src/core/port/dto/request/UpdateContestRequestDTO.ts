import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type UpdateContestRequestDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  settings: {
    isAutoJudgeEnabled: boolean;
  };
  members: {
    id?: string;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
  }[];
  problems: {
    id?: string;
    letter: string;
    title: string;
    description: AttachmentResponseDTO;
    timeLimit: number;
    memoryLimit: number;
    testCases: AttachmentResponseDTO;
  }[];
};
