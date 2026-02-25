import {
  staffDashboardSlice,
  StaffDashboardState,
} from "@/app/_store/slices/staff-dashboard-slice";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/dashboard/MockStaffDashboardResponseDTO";
import { MockLeaderboardCellResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardCellResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionResponseDTO } from "@/test/mock/response/submission/MockSubmissionResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

describe("staffDashboardSlice", () => {
  const stateWithData: StaffDashboardState = {
    ...MockStaffDashboardResponseDTO(),
  };

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a partial leaderboard", () => {
    const leaderboardCell = MockLeaderboardCellResponseDTO({
      memberId: stateWithData.leaderboard.rows[0].memberId,
      problemId: stateWithData.leaderboard.rows[0].cells[0].problemId,
      isAccepted: !stateWithData.leaderboard.rows[0].cells[0].isAccepted,
    });

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeLeaderboard(leaderboardCell),
    );

    expect(state.leaderboard.rows[0].cells[0].isAccepted).toBe(
      leaderboardCell.isAccepted,
    );
  });

  it("should set the leaderboard as frozen", () => {
    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.setLeaderboardIsFrozen(true),
    );

    expect(state.leaderboard.isFrozen).toBe(true);
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionResponseDTO();

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionResponseDTO = {
      ...stateWithData.submissions[0],
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
      version: 2,
    };

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a batch of submissions", () => {
    const newSubmissions = [
      MockSubmissionResponseDTO(),
      MockSubmissionResponseDTO(),
    ];

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeSubmissionBatch(newSubmissions),
    );

    expect(state.submissions).toHaveLength(3);
    expect(state.submissions).toEqual(
      expect.arrayContaining([...stateWithData.submissions, ...newSubmissions]),
    );
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.announcements).toHaveLength(2);
    expect(state.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.clarifications).toHaveLength(2);
    expect(state.clarifications).toContainEqual(mockClarification);
  });

  it("should merge a child clarification to the correct parent", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: stateWithData.clarifications[0]?.id,
    });

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.clarifications).toHaveLength(1);
    expect(state.clarifications[0].children).toHaveLength(1);
    expect(state.clarifications[0].children[0]).toEqual(mockClarification);
  });

  it("should delete a clarification by id", () => {
    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.deleteClarification(
        stateWithData.clarifications[0].id,
      ),
    );

    expect(state.clarifications).toHaveLength(0);
  });

  it("should merge a new ticket", () => {
    const ticket = MockTicketResponseDTO();

    const state = staffDashboardSlice.reducer(
      stateWithData,
      staffDashboardSlice.actions.mergeTicket(ticket),
    );

    expect(state.tickets).toHaveLength(2);
    expect(state.tickets).toContainEqual(ticket);
  });
});
