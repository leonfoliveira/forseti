import { createSlice } from "@reduxjs/toolkit";

import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { StaffDashboardResponseDTO } from "@/port/dto/response/dashboard/StaffDashboardResponseDTO";

export type StaffDashboardState = StaffDashboardResponseDTO;

/**
 * Redux slice for the staff dashboard data.
 */
export const StaffDashboardSlice = createSlice({
  name: "staffDashboard",
  initialState: {} as unknown as StaffDashboardState,
  reducers: {
    set(state, action: { payload: StaffDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    reset() {
      return {} as unknown as StaffDashboardState;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    mergeLeaderboard(state, action: { payload: LeaderboardCellResponseDTO }) {
      state.leaderboard = LeaderboardMerger.merge(
        state.leaderboard,
        action.payload,
      );
    },
    setLeaderboardIsFrozen(state, action: { payload: boolean }) {
      state.leaderboard.isFrozen = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionWithCodeResponseDTO }) {
      state.submissions = EntityUtil.merge(state.submissions, action.payload);
    },
    mergeSubmissionBatch(
      state,
      action: { payload: SubmissionWithCodeResponseDTO[] },
    ) {
      state.submissions = EntityUtil.mergeBatch(
        state.submissions,
        action.payload,
      );
    },
    mergeAnnouncement(state, action: { payload: AnnouncementResponseDTO }) {
      state.announcements = EntityUtil.merge(
        state.announcements,
        action.payload,
      );
    },
    mergeClarification(state, action: { payload: ClarificationResponseDTO }) {
      state.clarifications = EntityUtil.merge(
        state.clarifications,
        action.payload,
      );
    },
    freeze(state) {
      state.contest.isFrozen = true;
    },
    unfreeze(
      state,
      action: {
        payload: {
          leaderboard: LeaderboardResponseDTO;
          submissions: SubmissionWithCodeResponseDTO[];
        };
      },
    ) {
      state.contest.isFrozen = false;
      state.leaderboard = action.payload.leaderboard;
      state.submissions = EntityUtil.mergeBatch(
        state.submissions,
        action.payload.submissions,
      );
    },
  },
});
