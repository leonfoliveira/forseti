import { Language } from "@/core/domain/enumerate/Language";
import { AnnouncementResponseDTO } from "@/core/port/driven/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/driven/repository/dto/response/clarification/ClarificationResponseDTO";
import { MemberFullResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/port/driven/repository/dto/response/problem/ProblemFullResponseDTO";

export type ContestFullResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: Language[];
  startAt: string;
  endAt: string;
  settings: {
    isAutoJudgeEnabled: boolean;
  };
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  members: MemberFullResponseDTO[];
  problems: ProblemFullResponseDTO[];
};
