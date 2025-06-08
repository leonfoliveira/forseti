import { Language } from "@/core/domain/enumerate/Language";

export type ContestMetadataResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
};
