import { createSlice } from "@reduxjs/toolkit";

import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type ContestantDashboardState = ContestantDashboardResponseDTO;

/**
 * Redux slice for the contestant dashboard data.
 */
export const ContestantDashboardSlice = createSlice({
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
      state.leaderboard = LeaderboardMerger.merge(
        state.leaderboard,
        action.payload,
      );
    },
    setLeaderboardIsFrozen(state, action: { payload: boolean }) {
      state.leaderboard.isFrozen = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionResponseDTO }) {
      state.submissions = EntityUtil.merge(state.submissions, action.payload);
    },
    mergeSubmissionBatch(state, action: { payload: SubmissionResponseDTO[] }) {
      state.submissions = EntityUtil.mergeBatch(
        state.submissions,
        action.payload,
      );
    },
    mergeMemberSubmission(
      state,
      action: { payload: SubmissionWithCodeResponseDTO },
    ) {
      state.memberSubmissions = EntityUtil.merge(
        state.memberSubmissions,
        action.payload,
      );
    },
  },
});
