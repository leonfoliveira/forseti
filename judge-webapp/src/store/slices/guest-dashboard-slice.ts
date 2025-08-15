import { createSlice } from "@reduxjs/toolkit";

import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { findClarification } from "@/lib/util/clarification-finder";
import { merge } from "@/lib/util/entity-merger";

import { useAppSelector } from "../store";

type StateType = {
  contest: ContestPublicResponseDTO;
  leaderboard: ContestLeaderboardResponseDTO;
  submissions: SubmissionPublicResponseDTO[];
};

export const guestDashboardSlice = createSlice({
  name: "guestDashboard",
  initialState: null as unknown as StateType,
  reducers: {
    set(state, action: { payload: StateType }) {
      state = action.payload;
    },
    setLeaderboard(state, action: { payload: ContestLeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionPublicResponseDTO }) {
      state.submissions = merge(state.submissions, action.payload);
    },
    mergeAnnouncement(state, action: { payload: AnnouncementResponseDTO }) {
      state.contest.announcements = merge(
        state.contest.announcements,
        action.payload,
      );
    },
    mergeClarification(state, action: { payload: ClarificationResponseDTO }) {
      if (!action.payload.parentId) {
        state.contest.clarifications = merge(
          state.contest.clarifications,
          action.payload,
        );
      } else {
        const parent = findClarification(
          state.contest.clarifications,
          action.payload.parentId,
        );
        if (parent) {
          parent.children = merge(parent.children, action.payload);
        }
      }

      state.contest.clarifications = merge(
        state.contest.clarifications,
        action.payload,
      );
    },
    deleteClarification(state, action: { payload: string }) {
      state.contest.clarifications = state.contest.clarifications.filter(
        (clarification) => clarification.id !== action.payload,
      );
    },
  },
});

export function useGuestDashboard<T>(
  selector: (state: StateType) => T = (state) => state as T,
) {
  return useAppSelector((state) => selector(state.guestDashboard));
}
