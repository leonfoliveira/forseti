import { Language } from "@/core/domain/enumerate/Language";
import { MemberFullResponseDTO } from "@/core/repository/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/repository/dto/response/problem/ProblemFullResponseDTO";

export type ContestFullResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: MemberFullResponseDTO[];
  problems: ProblemFullResponseDTO[];
};
