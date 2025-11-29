import { createSlice } from "@reduxjs/toolkit";

import { findClarification } from "@/app/_store/util/clarification-finder";
import { mergeEntity } from "@/app/_store/util/entity-util";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { GuestDashboardResponseDTO } from "@/core/port/dto/response/dashboard/GuestDashboardResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

export const guestDashboardSlice = createSlice({
  name: "guestDashboard",
  initialState: null as unknown as GuestDashboardResponseDTO,
  reducers: {
    set(state, action: { payload: GuestDashboardResponseDTO }) {
      return action.payload;
    },
    setLeaderboard(state, action: { payload: LeaderboardResponseDTO }) {
      state.leaderboard = action.payload;
    },
    mergeSubmission(state, action: { payload: SubmissionPublicResponseDTO }) {
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
