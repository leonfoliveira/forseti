import { Language } from "@/core/domain/enumerate/Language";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { Attachment } from "@/core/domain/model/Attachment";

export type ContestPublicResponseDTO = {
  id: number;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: {
    id: number;
    type: MemberType;
    name: string;
  }[];
  problems: {
    id: number;
    title: string;
    description: Attachment;
  }[];
};
