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
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { defineMessages } from "@/i18n/message";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useErrorHandler } from "@/lib/util/error-handler-hook";
import { useToast } from "@/lib/util/toast-hook";
import { guestDashboardSlice } from "@/store/slices/guest-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

const messages = defineMessages({
  loadError: {
    id: "lib.provider.guest-dashboard-provider.load-error",
    defaultMessage: "Error loading contest data",
  },
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
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const { isLoading, error } = useAppSelector((state) => state.guestDashboard);
  const dispatch = useAppDispatch();
  const errorHandler = useErrorHandler();
  const toast = useToast();

  useEffect(() => {
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          leaderboardService.findContestLeaderboard(contestMetadata.id),
          submissionService.findAllContestSubmissions(contestMetadata.id),
        ]);

        await listenerClient.connect();
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listenerClient,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          submissionListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveSubmission,
          ),
          announcementListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveAnnouncement,
          ),
          clarificationListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveClarification,
          ),
          clarificationListener.subscribeForContestDeleted(
            listenerClient,
            contestMetadata.id,
            deleteClarification,
          ),
        ]);

        dispatch(
          guestDashboardSlice.actions.success({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
          }),
        );
      } catch (error) {
        errorHandler.handle(error as Error, {
          default: () =>
            dispatch(guestDashboardSlice.actions.fail(error as Error)),
        });
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
    };
  }, []);

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

  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage />;
  }

  return children;
}
