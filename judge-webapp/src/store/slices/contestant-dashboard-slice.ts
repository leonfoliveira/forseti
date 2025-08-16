import { createSlice } from "@reduxjs/toolkit";

import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { findClarification } from "@/lib/util/clarification-finder";
import { merge } from "@/lib/util/entity-merger";

import { useAppSelector } from "../store";

type DataType = {
  contest: ContestPublicResponseDTO;
  leaderboard: ContestLeaderboardResponseDTO;
  submissions: SubmissionPublicResponseDTO[];
  memberSubmissions: SubmissionFullResponseDTO[];
};
type StateType =
  | {
      isLoading: true;
      error: null;
      data: null;
    }
  | { isLoading: false; error: Error; data: null }
  | {
      isLoading: false;
      error: null;
      data: DataType;
    };

export const contestantDashboardSlice = createSlice({
  name: "contestantDashboard",
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
      state.error = action.payload;
      state.data = null;
    },
    setLeaderboard(state, action: { payload: ContestLeaderboardResponseDTO }) {
      state.data!.leaderboard = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionPublicResponseDTO }) {
      state.data!.submissions = merge(state.data!.submissions, action.payload);
    },
    mergeMemberSubmission(
      state,
      action: { payload: SubmissionFullResponseDTO },
    ) {
      state.data!.memberSubmissions = merge(
        state.data!.memberSubmissions,
        action.payload,
      );
    },
    mergeAnnouncement(state, action: { payload: AnnouncementResponseDTO }) {
      state.data!.contest.announcements = merge(
        state.data!.contest.announcements,
        action.payload,
      );
    },
    mergeClarification(state, action: { payload: ClarificationResponseDTO }) {
      if (!action.payload.parentId) {
        state.data!.contest.clarifications = merge(
          state.data!.contest.clarifications,
          action.payload,
        );
      } else {
        const parent = findClarification(
          state.data!.contest.clarifications,
          action.payload.parentId,
        );
        if (parent) {
          parent.children = merge(parent.children, action.payload);
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

export function useContestantDashboard<T>(
  selector: (state: DataType) => T = (state) => state as T,
) {
  return useAppSelector((state) => selector(state.contestantDashboard.data!));
}
