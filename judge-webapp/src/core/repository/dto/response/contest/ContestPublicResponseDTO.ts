import { Language } from "@/core/domain/enumerate/Language";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";

export type ContestPublicResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  problems: ProblemPublicResponseDTO[];
  members: MemberPublicResponseDTO[];
};
