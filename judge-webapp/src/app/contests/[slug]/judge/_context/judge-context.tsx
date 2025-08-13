import React, { useEffect } from "react";
import { defineMessages } from "react-intl";

import { useLoadableState } from "@/app/_util/loadable-state";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useAlert } from "@/store/slices/alerts-slice";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { judgeDashboardSlice } from "@/store/slices/judge-dashboard-slice";
import { useToast } from "@/store/slices/toasts-slice";
import { useAppDispatch } from "@/store/store";

const messages = defineMessages({
  loadError: {
    id: "app.contests.[slug].judge._context.judge-context.load-error",
    defaultMessage: "Error loading contest data",
  },
  submissionFailed: {
    id: "app.contests.[slug].judge._context.judge-context.submission-failed",
    defaultMessage: "New failed submission",
  },
  announcement: {
    id: "app.contests.[slug].judge._context.judge-context.announcement",
    defaultMessage: "New announcement: {text}",
  },
});

export function JudgeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useLoadableState({ isLoading: true });

  const contestMetadata = useContestMetadata();
  const dispatch = useAppDispatch();
  const alert = useAlert();
  const toast = useToast();

  useEffect(() => {
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      state.start();
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          contestService.findContestLeaderboardById(contestMetadata.id),
          contestService.findAllContestFullSubmissions(contestMetadata.id),
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
        state.fail(error, {
          default: () => alert.error(messages.loadError),
        });
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
    };
  }, []);

  function receiveLeaderboard(leaderboard: ContestLeaderboardResponseDTO) {
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

    alert.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeClarification(clarification));
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
