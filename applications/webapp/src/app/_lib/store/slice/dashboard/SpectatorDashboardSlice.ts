import { createSlice } from "@reduxjs/toolkit";

import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";
import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { SpectatorDashboardResponseDTO } from "@/port/dto/response/dashboard/SpectatorDashboardResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";

export type SpectatorDashboardState = SpectatorDashboardResponseDTO;

/**
 * Redux slice for the guest dashboard data.
 */
export const SpectatorDashboardSlice = createSlice({
  name: "spectatorDashboard",
  initialState: {
    listenerStatus: ListenerStatus.DISCONNECTED,
  } as unknown as SpectatorDashboardState,
  reducers: {
    set(state, action: { payload: SpectatorDashboardResponseDTO }) {
      return { ...action.payload, listenerStatus: ListenerStatus.CONNECTED };
    },
    reset() {
      return {} as unknown as SpectatorDashboardState;
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
    mergeSubmission(state, action: { payload: SubmissionResponseDTO }) {
      state.submissions = EntityUtil.merge(state.submissions, action.payload);
    },
    mergeSubmissionBatch(state, action: { payload: SubmissionResponseDTO[] }) {
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
    freeze(state, action: { payload: ContestResponseDTO }) {
      state.contest = action.payload;
    },
    unfreeze(
      state,
      action: {
        payload: {
          contest: ContestResponseDTO;
          leaderboard: LeaderboardResponseDTO;
          submissions: SubmissionResponseDTO[];
        };
      },
    ) {
      state.contest = action.payload.contest;
      state.leaderboard = action.payload.leaderboard;
      state.submissions = EntityUtil.mergeBatch(
        state.submissions,
        action.payload.submissions,
      );
    },
  },
});
