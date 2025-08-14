import { Language } from "@/core/domain/enumerate/Language";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { MemberFullResponseDTO } from "@/core/repository/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/repository/dto/response/problem/ProblemFullResponseDTO";

export type ContestFullResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  members: MemberFullResponseDTO[];
  problems: ProblemFullResponseDTO[];
};
