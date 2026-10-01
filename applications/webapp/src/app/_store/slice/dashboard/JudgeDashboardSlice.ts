import { createSlice } from "@reduxjs/toolkit";

import { EntityUtil } from "@/app/_store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type JudgeDashboardState = JudgeDashboardResponseDTO;

/**
 * Redux slice for the judge dashboard data.
 */
export const JudgeDashboardSlice = createSlice({
  name: "judgeDashboard",
  initialState: {
    listenerStatus: ListenerStatus.DISCONNECTED,
  } as unknown as JudgeDashboardState,
  reducers: {
    set(state, action: { payload: JudgeDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    reset() {
      return {} as unknown as JudgeDashboardState;
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
  },
});
