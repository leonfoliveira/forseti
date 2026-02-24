import { createSlice } from "@reduxjs/toolkit";

import { findClarification } from "@/app/_store/util/clarification-finder";
import { mergeEntity } from "@/app/_store/util/entity-util";
import { mergeLeaderboard } from "@/app/_store/util/leaderboard-merger";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type AdminDashboardState = AdminDashboardResponseDTO & {
  listenerStatus: ListenerStatus;
};

/**
 * Redux slice for the admin dashboard data.
 */
export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {
    listenerStatus: ListenerStatus.DISCONNECTED,
  } as unknown as AdminDashboardState,
  reducers: {
    set(state, action: { payload: AdminDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    setListenerStatus(state, action: { payload: ListenerStatus }) {
      state.listenerStatus = action.payload;
    },
    setContest(state, action: { payload: ContestWithMembersAndProblemsDTO }) {
      state.contest = action.payload;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    setLeaderboardIsFrozen(state, action: { payload: boolean }) {
      state.leaderboard.isFrozen = action.payload;
    },
    mergeLeaderboard(state, action: { payload: LeaderboardCellResponseDTO }) {
      state.leaderboard = mergeLeaderboard(state.leaderboard, action.payload);
    },
    mergeSubmission(
      state,
      action: { payload: SubmissionWithCodeAndExecutionsResponseDTO },
    ) {
      state.submissions = mergeEntity(state.submissions, action.payload);
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
    mergeTicket(state, action: { payload: TicketResponseDTO }) {
      state.tickets = mergeEntity(state.tickets, action.payload);
    },
  },
});
