import { createSlice } from "@reduxjs/toolkit";

import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { findClarification } from "@/store/util/clarification-finder";
import { mergeEntity } from "@/store/util/entity-util";

type DataType = {
  contest: ContestFullResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullResponseDTO[];
};
type StateType =
  | {
      isLoading: true;
      error: null;
      data: null;
    }
  | { isLoading: false; error: string; data: null }
  | {
      isLoading: false;
      error: null;
      data: DataType;
    };

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: {
    isLoading: true,
    error: null,
    data: null,
  } as StateType,
  reducers: {
    success(state, action: { payload: DataType }) {
      state.isLoading = false;
      state.error = null;
      state.data = action.payload;
    },
    fail(state, action: { payload: Error }) {
      state.isLoading = false;
      state.error = action.payload.name;
      state.data = null;
    },
    setContest(state, action: { payload: ContestFullResponseDTO }) {
      state.data!.contest = action.payload;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.data!.leaderboard = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionFullResponseDTO }) {
      state.data!.submissions = mergeEntity(
        state.data!.submissions,
        action.payload,
      );
    },
    mergeAnnouncement(state, action: { payload: AnnouncementResponseDTO }) {
      state.data!.contest.announcements = mergeEntity(
        state.data!.contest.announcements,
        action.payload,
      );
    },
    mergeClarification(state, action: { payload: ClarificationResponseDTO }) {
      if (!action.payload.parentId) {
        state.data!.contest.clarifications = mergeEntity(
          state.data!.contest.clarifications,
          action.payload,
        );
      } else {
        const parent = findClarification(
          state.data!.contest.clarifications,
          action.payload.parentId,
        );
        if (parent) {
          parent.children = mergeEntity(parent.children, action.payload);
        }
      }
    },
    deleteClarification(state, action: { payload: string }) {
      state.data!.contest.clarifications =
        state.data!.contest.clarifications.filter(
          (clarification) => clarification.id !== action.payload,
        );
    },
  },
});
