import { Language } from "@/core/domain/enumerate/Language";
import { MemberResponseDTO } from "@/core/repository/dto/response/MemberResponseDTO";
import { ProblemPrivateResponseDTO } from "@/core/repository/dto/response/ProblemPrivateResponseDTO";

export type ContestPrivateResponseDTO = {
  id: number;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: MemberResponseDTO[];
  problems: ProblemPrivateResponseDTO[];
};
