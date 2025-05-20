import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { AttachmentRequestDTO } from "@/core/repository/dto/request/AttachmentRequestDTO";

export type CreateContestRequestDTO = {
  title: string;
  languages: Language[];
  startAt: Date;
  endAt: Date;
  members: {
    type: MemberType;
    name: string;
    login: string;
    password: string;
  }[];
  problems: {
    title: string;
    timeLimit: number;
    testCases: AttachmentRequestDTO;
  }[];
};
