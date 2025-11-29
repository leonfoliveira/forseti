import { createSlice } from "@reduxjs/toolkit";

import { AnnouncementResponseDTO } from "@/core/port/driven/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/driven/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestFullResponseDTO } from "@/core/port/driven/repository/dto/response/contest/ContestFullResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/driven/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionFullResponseDTO";
import { findClarification } from "@/store/util/clarification-finder";
import { mergeEntity } from "@/store/util/entity-util";

type StateType = {
  contest: ContestFullResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullResponseDTO[];
};

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState: null as unknown as StateType,
  reducers: {
    set(state, action: { payload: StateType }) {
      return action.payload;
    },
    setContest(state, action: { payload: ContestFullResponseDTO }) {
      state.contest = action.payload;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionFullResponseDTO }) {
      state.submissions = mergeEntity(state.submissions, action.payload);
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
