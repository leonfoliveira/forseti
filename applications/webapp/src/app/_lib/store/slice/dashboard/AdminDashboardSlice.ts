import { createSlice } from "@reduxjs/toolkit";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";

export type AdminDashboardState = AdminDashboardResponseDTO;

/**
 * Redux slice for the admin dashboard data.
 */
export const AdminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {} as unknown as AdminDashboardState,
  reducers: {
    set(state, action: { payload: AdminDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    reset() {
      return {} as unknown as AdminDashboardState;
    },
    setContest(
      state,
      action: { payload: ContestWithMembersAndProblemsResponseDTO },
    ) {
      state.contest = action.payload;
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
    mergeSubmission(
      state,
      action: { payload: SubmissionWithCodeAndExecutionsResponseDTO },
    ) {
      state.submissions = EntityUtil.merge(state.submissions, action.payload);
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
    freeze(
      state,
      action: { payload: ContestWithMembersAndProblemsResponseDTO },
    ) {
      console.debug("Freezing contest:", action.payload);
      state.contest = action.payload;
    },
    unfreeze(
      state,
      action: {
        payload: {
          contest: ContestWithMembersAndProblemsResponseDTO;
          leaderboard: LeaderboardResponseDTO;
          submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
        };
      },
    ) {
      console.debug("Unfreezing contest:", action.payload);
      state.contest = action.payload.contest;
      state.leaderboard = action.payload.leaderboard;
      state.submissions = EntityUtil.mergeBatch(
        state.submissions,
        action.payload.submissions,
      );
    },
  },
});
