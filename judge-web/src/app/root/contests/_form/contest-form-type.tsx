import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { DownloadAttachmentResponseDTO } from "@/core/repository/dto/response/DownloadAttachmentResponseDTO";

export type ContestFormType = Partial<{
  id: number;
  title: string;
  languages: Language[];
  startAt: Date;
  endAt: Date;
  members: ContestFormMemberType[];
  problems: ContestFormProblemType[];
}>;

export type ContestFormMemberType = Partial<{
  _id: number;
  type: MemberType;
  name: string;
  login: string;
  password: string;
}>;

export type ContestFormProblemType = Partial<{
  _id: number;
  title: string;
  description: string;
  timeLimit: number;
  _testCases: DownloadAttachmentResponseDTO;
  forceSelect: boolean;
  testCases: File;
}>;
