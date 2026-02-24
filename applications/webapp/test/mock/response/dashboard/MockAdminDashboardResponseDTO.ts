import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/contest/MockContestWithMembersAndProblemsDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockMemberWithLoginResponseDTO } from "@/test/mock/response/member/MockMemberWithLoginResponseDTO";
import { MockProblemWithTestCasesResponseDTO } from "@/test/mock/response/problem/MockProblemWithTestCasesResponseDTO";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

export function MockAdminDashboardResponseDTO(
  partial: Partial<AdminDashboardResponseDTO> = {},
): AdminDashboardResponseDTO {
  return {
    contest: MockContestWithMembersAndProblemsDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    members: [MockMemberWithLoginResponseDTO()],
    problems: [MockProblemWithTestCasesResponseDTO()],
    submissions: [MockSubmissionWithCodeAndExecutionsResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    announcements: [MockAnnouncementResponseDTO()],
    tickets: [MockTicketResponseDTO()],
    memberTickets: [MockTicketResponseDTO()],
    ...partial,
  };
}
