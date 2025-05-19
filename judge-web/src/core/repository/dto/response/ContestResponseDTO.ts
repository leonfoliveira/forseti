import { Language } from "@/core/domain/enumerate/Language";
import { MemberResponseDTO } from "@/core/repository/dto/response/MemberResponseDTO";
import { ProblemResponseDTO } from "@/core/repository/dto/response/ProblemResponseDTO";

export type ContestResponseDTO = {
  id: number;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  members: MemberResponseDTO[];
  problems: ProblemResponseDTO[];
};
