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
import { useLoadableState } from "@/lib/util/loadable-state";
import { useToast } from "@/lib/util/toast-hook";
import { judgeDashboardSlice } from "@/store/slices/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

const messages = defineMessages({
  submissionFailed: {
    id: "lib.provider.judge-dashboard-provider.submission-failed",
    defaultMessage: "New failed submission",
  },
  announcement: {
    id: "lib.provider.judge-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  newClarification: {
    id: "lib.provider.judge-dashboard-provider.new-clarification",
    defaultMessage: "New clarification",
  },
});

export function JudgeDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorization = useAppSelector((state) => state.authorization);
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    state.start();
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
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
          judgeDashboardSlice.actions.set({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
          }),
        );
        state.finish();
      } catch (error) {
        state.fail(error);
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
    };
  }, [authorization, contestMetadata.id]);

  function receiveLeaderboard(leaderboard: LeaderboardResponseDTO) {
    dispatch(judgeDashboardSlice.actions.setLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionFullResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(messages.submissionFailed);
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== authorization?.member.id) {
      toast.warning({
        ...messages.announcement,
        values: { text: announcement.text },
      });
    }
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeClarification(clarification));
    if (!clarification.parentId) {
      toast.info(messages.newClarification);
    }
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(judgeDashboardSlice.actions.deleteClarification(id));
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return children;
}
