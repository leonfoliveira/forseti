import { createSlice } from "@reduxjs/toolkit";

import { findClarification } from "@/app/_store/util/clarification-finder";
import { mergeEntity, mergeEntityBatch } from "@/app/_store/util/entity-util";
import { mergeLeaderboard } from "@/app/_store/util/leaderboard-merger";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestantDashboardResponseDTO } from "@/core/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type ContestantDashboardState = ContestantDashboardResponseDTO;

/**
 * Redux slice for the contestant dashboard data.
 */
export const contestantDashboardSlice = createSlice({
  name: "contestantDashboard",
  initialState: {} as unknown as ContestantDashboardState,
  reducers: {
    set(state, action: { payload: ContestantDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    reset() {
      return {} as unknown as ContestantDashboardState;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    mergeLeaderboard(state, action: { payload: LeaderboardCellResponseDTO }) {
      state.leaderboard = mergeLeaderboard(state.leaderboard, action.payload);
    },
    setLeaderboardIsFrozen(state, action: { payload: boolean }) {
      state.leaderboard.isFrozen = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionResponseDTO }) {
      state.submissions = mergeEntity(state.submissions, action.payload);
    },
    mergeSubmissionBatch(state, action: { payload: SubmissionResponseDTO[] }) {
      state.submissions = mergeEntityBatch(state.submissions, action.payload);
    },
    mergeMemberSubmission(
      state,
      action: { payload: SubmissionWithCodeResponseDTO },
    ) {
      state.memberSubmissions = mergeEntity(
        state.memberSubmissions,
        action.payload,
      );
    },
    mergeAnnouncement(state, action: { payload: AnnouncementResponseDTO }) {
      state.announcements = mergeEntity(state.announcements, action.payload);
    },
    mergeClarification(state, action: { payload: ClarificationResponseDTO }) {
      if (!action.payload.parentId) {
        state.clarifications = mergeEntity(
          state.clarifications,
          action.payload,
        );
      } else {
        const parent = findClarification(
          state.clarifications,
          action.payload.parentId,
        );
        if (parent) {
          parent.children = mergeEntity(parent.children, action.payload);
        }
      }
    },
    deleteClarification(state, action: { payload: string }) {
      state.clarifications = state.clarifications.filter(
        (clarification) => clarification.id !== action.payload,
      );
    },
    mergeMemberTicket(state, action: { payload: TicketResponseDTO }) {
      state.memberTickets = mergeEntity(state.memberTickets, action.payload);
    },
  },
});
