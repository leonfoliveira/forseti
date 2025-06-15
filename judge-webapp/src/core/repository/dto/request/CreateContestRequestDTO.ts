import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Attachment } from "@/core/domain/model/Attachment";

export type CreateContestRequestDTO = {
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: {
    type: MemberType;
    name: string;
    login: string;
    password: string;
  }[];
  problems: {
    letter: string;
    title: string;
    description: Attachment;
    timeLimit: number;
    memoryLimit: number;
    testCases: Attachment;
  }[];
};
