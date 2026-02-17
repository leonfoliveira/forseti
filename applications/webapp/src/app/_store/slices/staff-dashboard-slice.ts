import { createSlice } from "@reduxjs/toolkit";

import { findClarification } from "@/app/_store/util/clarification-finder";
import { mergeEntity, mergeEntityBatch } from "@/app/_store/util/entity-util";
import { mergeLeaderboard } from "@/app/_store/util/leaderboard-merger";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { StaffDashboardResponseDTO } from "@/core/port/dto/response/dashboard/StaffDashboardResponseDTO";
import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

export type StaffDashboardState = StaffDashboardResponseDTO & {
  listenerStatus: ListenerStatus;
};

/**
 * Redux slice for the staff dashboard data.
 */
export const staffDashboardSlice = createSlice({
  name: "staffDashboard",
  initialState: {
    listenerStatus: ListenerStatus.DISCONNECTED,
  } as unknown as StaffDashboardState,
  reducers: {
    set(state, action: { payload: StaffDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    setListenerStatus(state, action: { payload: ListenerStatus }) {
      state.listenerStatus = action.payload;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    mergeLeaderboard(
      state,
      action: { payload: LeaderboardPartialResponseDTO },
    ) {
      state.leaderboard = mergeLeaderboard(state.leaderboard, action.payload);
    },
    setLeaderboardIsFrozen(state, action: { payload: boolean }) {
      state.leaderboard.isFrozen = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionPublicResponseDTO }) {
      state.submissions = mergeEntity(state.submissions, action.payload);
    },
    mergeSubmissionBatch(
      state,
      action: { payload: SubmissionPublicResponseDTO[] },
    ) {
      state.submissions = mergeEntityBatch(state.submissions, action.payload);
    },
    mergeAnnouncement(state, action: { payload: AnnouncementResponseDTO }) {
      state.contest.announcements = mergeEntity(
        state.contest.announcements,
        action.payload,
      );
    },
    mergeClarification(state, action: { payload: ClarificationResponseDTO }) {
      if (!action.payload.parentId) {
        state.contest.clarifications = mergeEntity(
          state.contest.clarifications,
          action.payload,
        );
      } else {
        const parent = findClarification(
          state.contest.clarifications,
          action.payload.parentId,
        );
        if (parent) {
          parent.children = mergeEntity(parent.children, action.payload);
        }
      }
    },
    deleteClarification(state, action: { payload: string }) {
      state.contest.clarifications = state.contest.clarifications.filter(
        (clarification) => clarification.id !== action.payload,
      );
    },
  },
});
