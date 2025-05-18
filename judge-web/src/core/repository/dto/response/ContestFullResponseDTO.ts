import { Language } from "@/core/domain/enumerate/Language";
import { MemberResponseDTO } from "@/core/repository/dto/response/MemberResponseDTO";
import { ProblemFullResponseDTO } from "@/core/repository/dto/response/ProblemFullResponseDTO";

export type ContestFullResponseDTO = {
  id: number;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: MemberResponseDTO[];
  problems: ProblemFullResponseDTO[];
};
