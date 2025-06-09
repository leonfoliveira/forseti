import { Language } from "@/core/domain/enumerate/Language";
import { Attachment } from "@/core/domain/model/Attachment";

export type ContestResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  problems: {
    id: string;
    letter: string;
    title: string;
    description: Attachment;
  }[];
  members: {
    id: string;
    type: string;
    name: string;
    score: number;
    penalty: number;
    problems: {
      id: string;
      isAccepted: boolean;
      wrongSubmissions: number;
      penalty: number;
    }[];
  }[];
};
