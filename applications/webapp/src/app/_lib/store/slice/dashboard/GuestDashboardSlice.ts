import { createSlice } from "@reduxjs/toolkit";

import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { GuestDashboardResponseDTO } from "@/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export type GuestDashboardState = GuestDashboardResponseDTO;

/**
 * Redux slice for the guest dashboard data.
 */
export const GuestDashboardSlice = createSlice({
  name: "guestDashboard",
  initialState: {
    listenerStatus: ListenerStatus.DISCONNECTED,
  } as unknown as GuestDashboardState,
  reducers: {
    set(state, action: { payload: GuestDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    reset() {
      return {} as unknown as GuestDashboardState;
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
  },
});
