import { Language } from "@/core/domain/enumerate/Language";
import { MemberFullResponseDTO } from "@/core/repository/dto/response/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/repository/dto/response/ProblemFullResponseDTO";

export type ContestFullResponseDTO = {
  id: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: MemberFullResponseDTO[];
  problems: ProblemFullResponseDTO[];
};
