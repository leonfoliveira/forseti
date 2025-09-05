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
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { defineMessages } from "@/i18n/message";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useErrorHandler } from "@/lib/util/error-handler-hook";
import { useToast } from "@/lib/util/toast-hook";
import { adminDashboardSlice } from "@/store/slices/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

const messages = defineMessages({
  loadError: {
    id: "lib.provider.admin-dashboard-provider.load-error",
    defaultMessage: "Error loading contest data",
  },
  submissionFailed: {
    id: "lib.provider.admin-dashboard-provider.submission-failed",
    defaultMessage: "New failed submission",
  },
  announcement: {
    id: "lib.provider.admin-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  newClarification: {
    id: "lib.provider.admin-dashboard-provider.new-clarification",
    defaultMessage: "New clarification",
  },
});

export function AdminDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAppSelector((state) => state.authorization);
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const { isLoading, error } = useAppSelector((state) => state.adminDashboard);
  const dispatch = useAppDispatch();
  const errorHandler = useErrorHandler();
  const toast = useToast();

  useEffect(() => {
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      try {
        const data = await Promise.all([
          contestService.findFullContestById(contestMetadata.id),
          leaderboardService.findContestLeaderboard(contestMetadata.id),
          submissionService.findAllContestFullSubmissions(contestMetadata.id),
        ]);

        await listenerClient.connect();
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listenerClient,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          submissionListener.subscribeForContestFull(
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
          adminDashboardSlice.actions.success({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
          }),
        );
      } catch (error) {
        errorHandler.handle(error as Error, {
          default: () =>
            dispatch(adminDashboardSlice.actions.fail(error as Error)),
        });
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
    };
  }, []);

  function receiveLeaderboard(leaderboard: LeaderboardResponseDTO) {
    dispatch(adminDashboardSlice.actions.setLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionFullResponseDTO) {
    dispatch(adminDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(messages.submissionFailed);
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    dispatch(adminDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== authorization?.member.id) {
      toast.warning({
        ...messages.announcement,
        values: { text: announcement.text },
      });
    }
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(adminDashboardSlice.actions.mergeClarification(clarification));
    if (!clarification.parentId) {
      toast.info(messages.newClarification);
    }
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(adminDashboardSlice.actions.deleteClarification(id));
  }

  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage />;
  }

  return children;
}
