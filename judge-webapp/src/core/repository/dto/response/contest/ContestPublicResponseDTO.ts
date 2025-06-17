import { Language } from "@/core/domain/enumerate/Language";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export type ContestPublicResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  problems: ProblemPublicResponseDTO[];
  members: MemberPublicResponseDTO[];
};
