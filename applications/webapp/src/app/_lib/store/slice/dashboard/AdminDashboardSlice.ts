import { createSlice } from "@reduxjs/toolkit";

import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
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
  },
});
