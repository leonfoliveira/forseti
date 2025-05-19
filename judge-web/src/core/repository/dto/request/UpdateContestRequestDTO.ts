import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { AttachmentRequestDTO } from "@/core/repository/dto/request/AttachmentRequestDTO";

export type UpdateContestRequestDTO = {
  id: number;
  title: string;
  languages: Language[];
  startAt: Date;
  endAt: Date;
  members: {
    id?: number;
    type: MemberType;
    name: string;
    login: string;
    password?: string;
  }[];
  problems: {
    id?: number;
    title: string;
    description: string;
    timeLimit: number;
    testCases?: AttachmentRequestDTO;
  }[];
};
