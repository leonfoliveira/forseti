import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { MockSubmissionResponseDTO } from "@/test/mock/response/submission/MockSubmissionResponseDTO";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

export function MockContestantDashboardResponseDTO(
  partial: Partial<ContestantDashboardResponseDTO> = {},
): ContestantDashboardResponseDTO {
  return {
    contest: MockContestResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    members: [MockMemberResponseDTO()],
    problems: [MockProblemResponseDTO()],
    submissions: [MockSubmissionResponseDTO()],
    memberSubmissions: [MockSubmissionWithCodeResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    announcements: [MockAnnouncementResponseDTO()],
    memberTickets: [MockTicketResponseDTO()],
    ...partial,
  };
}
