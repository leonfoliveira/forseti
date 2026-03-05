import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";
import { MockProblemWithTestCasesResponseDTO } from "@/test/mock/response/problem/MockProblemWithTestCasesResponseDTO";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

export function MockStaffDashboardResponseDTO(
  partial: Partial<StaffDashboardResponseDTO> = {},
): StaffDashboardResponseDTO {
  return {
    contest: MockContestResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    members: [MockMemberResponseDTO()],
    problems: [MockProblemWithTestCasesResponseDTO()],
    submissions: [MockSubmissionWithCodeAndExecutionsResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    announcements: [MockAnnouncementResponseDTO()],
    tickets: [MockTicketResponseDTO()],
    memberTickets: [MockTicketResponseDTO()],
    ...partial,
  };
}
