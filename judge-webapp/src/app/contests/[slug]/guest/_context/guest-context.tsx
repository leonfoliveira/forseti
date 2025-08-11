import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import React, { createContext, useContext, useEffect } from "react";
import { useLoadableState } from "@/app/_util/loadable-state";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { useContestMetadata } from "@/app/contests/[slug]/_context/contest-metadata-context";
import { useAlert } from "@/store/slices/alerts-slice";
import { merge } from "@/app/contests/[slug]/_util/entity-merger";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { findClarification } from "@/app/contests/[slug]/_util/clarification-finder";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { defineMessages } from "react-intl";

const messages = defineMessages({
  loadError: {
    id: "app.contests.[slug].guest._context.guest-context.load-error",
    defaultMessage: "Error loading contest data",
  },
  announcement: {
    id: "app.contests.[slug].guest._context.guest-context.announcement",
    defaultMessage: "New announcement: {text}",
  },
});

type GuestContextType = {
  contest: ContestPublicResponseDTO;
  leaderboard: ContestLeaderboardResponseDTO;
  submissions: SubmissionPublicResponseDTO[];
};

const GuestContext = createContext<GuestContextType>({
  contest: {} as ContestPublicResponseDTO,
  leaderboard: {} as ContestLeaderboardResponseDTO,
  submissions: [],
});

export function GuestContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useLoadableState<GuestContextType>({ isLoading: true });

  const contestMetadata = useContestMetadata();
  const alert = useAlert();

  useEffect(() => {
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      state.start();
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          contestService.findContestLeaderboardById(contestMetadata.id),
          contestService.findAllContestSubmissions(contestMetadata.id),
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

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    state.finish((prevState) => {
      prevState.submissions = merge(prevState.submissions, submission);
      return { ...prevState };
    });
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
    <GuestContext.Provider value={state.data!}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuestContext() {
  return useContext(GuestContext);
}
