import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import React, { createContext, useContext, useEffect } from "react";
import { useLoadableState } from "@/app/_util/loadable-state";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { merge } from "@/app/contests/[slug]/_util/entity-merger";
import { findClarification } from "@/app/contests/[slug]/_util/clarification-finder";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { defineMessages } from "react-intl";
import { useAlert } from "@/store/slices/alerts-slice";
import { useToast } from "@/store/slices/toasts-slice";

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

type JudgeContextType = {
  contest: ContestPublicResponseDTO;
  leaderboard: ContestLeaderboardResponseDTO;
  submissions: SubmissionFullResponseDTO[];
};

const JudgeContext = createContext<JudgeContextType>({
  contest: {} as ContestPublicResponseDTO,
  leaderboard: {} as ContestLeaderboardResponseDTO,
  submissions: [] as SubmissionFullResponseDTO[],
});

export function JudgeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useLoadableState<JudgeContextType>({ isLoading: true });

  const contestMetadata = useContestMetadata();
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

        state.finish({
          contest: data[0],
          leaderboard: data[1],
          submissions: data[2],
        });
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
    state.finish((prevState) => {
      prevState.leaderboard = leaderboard;
      return { ...prevState };
    });
  }

  function receiveSubmission(submission: SubmissionFullResponseDTO) {
    state.finish((prevState) => {
      return {
        ...prevState,
        submissions: merge(prevState.submissions, submission),
      };
    });

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(messages.submissionFailed);
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    state.finish((prevState) => {
      prevState.contest.announcements = merge(
        prevState.contest.announcements,
        announcement,
      );
      return { ...prevState };
    });

    alert.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    state.finish((prevState) => {
      if (!clarification.parentId) {
        prevState.contest.clarifications = merge(
          prevState.contest.clarifications,
          clarification,
        );
      } else {
        const parent = findClarification(
          prevState.contest.clarifications,
          clarification.parentId,
        );
        if (parent) {
          parent.children = merge(parent.children, clarification);
        }
      }

      return {
        ...prevState,
      };
    });
  }

  function deleteClarification({ id }: { id: string }) {
    state.finish((prevState) => {
      prevState.contest.clarifications =
        prevState.contest.clarifications.filter((c) => c.id !== id);
      return { ...prevState };
    });
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return (
    <JudgeContext.Provider value={state.data!}>
      {children}
    </JudgeContext.Provider>
  );
}

export function useJudgeContext() {
  return useContext(JudgeContext);
}
