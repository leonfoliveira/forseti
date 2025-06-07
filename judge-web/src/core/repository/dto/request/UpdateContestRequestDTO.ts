import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Attachment } from "@/core/domain/model/Attachment";

export type UpdateContestRequestDTO = {
  id: string;
  title: string;
  languages: Language[];
  startAt: Date;
  endAt: Date;
  members: {
    id?: string;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
  }[];
  problems: {
    id?: string;
    title: string;
    description: Attachment;
    timeLimit: number;
    testCases: Attachment;
  }[];
};
