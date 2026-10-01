import { MemberType } from "@/domain/enumerate/MemberType";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";

export type UpdateContestRequestDTO = {
  slug: string;
  title: string;
  languages: SubmissionLanguage[];
  startAt: string;
  endAt: string;
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
    color: string;
    title: string;
    description: AttachmentResponseDTO;
    timeLimit: number;
    memoryLimit: number;
    testCases: AttachmentResponseDTO;
  }[];
};
