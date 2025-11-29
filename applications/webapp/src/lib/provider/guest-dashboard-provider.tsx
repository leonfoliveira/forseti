import React, { useEffect } from "react";

import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  leaderboardService,
  listenerClientFactory,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/driven/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/driven/repository/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/driven/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { defineMessages } from "@/i18n/message";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useToast } from "@/lib/util/toast-hook";
import { guestDashboardSlice } from "@/store/slices/guest-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

const messages = defineMessages({
  announcement: {
    id: "lib.provider.guest-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
});

export function GuestDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const listenerClientRef = React.useRef<ListenerClient | null>(null);

  useEffect(() => {
    state.start();

    async function fetch() {
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          leaderboardService.findContestLeaderboard(contestMetadata.id),
          submissionService.findAllContestSubmissions(contestMetadata.id),
        ]);

        listenerClientRef.current = listenerClientFactory.create();
        await listenerClientRef.current.connect();
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listenerClientRef.current,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          submissionListener.subscribeForContest(
            listenerClientRef.current,
            contestMetadata.id,
            receiveSubmission,
          ),
          announcementListener.subscribeForContest(
            listenerClientRef.current,
            contestMetadata.id,
            receiveAnnouncement,
          ),
          clarificationListener.subscribeForContest(
            listenerClientRef.current,
            contestMetadata.id,
            receiveClarification,
          ),
          clarificationListener.subscribeForContestDeleted(
            listenerClientRef.current,
            contestMetadata.id,
            deleteClarification,
          ),
        ]);

        dispatch(
          guestDashboardSlice.actions.set({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
          }),
        );
        state.finish();
      } catch (error) {
        state.fail(error as Error);
      }
    }

    fetch();

    return () => {
      if (listenerClientRef.current) {
        listenerClientRef.current.disconnect();
      }
    };
  }, [session, contestMetadata.id]);

  function receiveLeaderboard(leaderboard: LeaderboardResponseDTO) {
    dispatch(guestDashboardSlice.actions.setLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    dispatch(guestDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    dispatch(guestDashboardSlice.actions.mergeAnnouncement(announcement));
    toast.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(guestDashboardSlice.actions.mergeClarification(clarification));
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(guestDashboardSlice.actions.deleteClarification(id));
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return children;
}
