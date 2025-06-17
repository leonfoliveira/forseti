import React, { createContext, useContext, useEffect, useRef } from "react";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerService,
} from "@/app/_composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useLoadableState } from "@/app/_util/loadable-state";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { routes } from "@/app/_routes";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { useGuestAnnex } from "@/app/contests/[slug]/_component/context/guest-annex";
import { useContestantAnnex } from "@/app/contests/[slug]/_component/context/contestant-annex";
import { useJuryAnnex } from "@/app/contests/[slug]/_component/context/jury-annex";
import { ContestMemberType } from "@/core/domain/enumerate/ContestMemberType";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export type ContestContextType = {
  contest: ContestPublicResponseDTO;
  leaderboard: ContestLeaderboardResponseDTO;
  guest: {
    submissions: SubmissionPublicResponseDTO[];
  };
  contestant: {
    submissions: SubmissionPublicResponseDTO[];
    memberSubmissions: SubmissionFullResponseDTO[];
    addSubmission: (submission: SubmissionFullResponseDTO) => void;
  };
  jury: {
    fullSubmissions: SubmissionFullResponseDTO[];
  };
};

const defaultContestContext: ContestContextType = {
  contest: {} as ContestPublicResponseDTO,
  leaderboard: {} as ContestLeaderboardResponseDTO,
  guest: {
    submissions: [],
  },
  contestant: {
    submissions: [],
    memberSubmissions: [],
    addSubmission: () => {},
  },
  jury: {
    fullSubmissions: [],
  },
};

const ContestContext = createContext<ContestContextType>(defaultContestContext);

export function ContestProvider({ children }: { children: React.ReactNode }) {
  const { authorization } = useAuthorization();
  const contestMetadata = useContestMetadata();
  const contestState = useLoadableState<ContestContextType>({
    isLoading: true,
  });

  const guestDataFetcher = useGuestAnnex(contestState);
  const contestantDataFetcher = useContestantAnnex(contestState);
  const juryDataFetcher = useJuryAnnex(contestState);

  const listener = useRef<ListenerClient>(undefined);

  useEffect(() => {
    async function findContestMetadata() {
      contestState.start();
      try {
        /**
         * Fetch all necessary data for the contest in parallel.
         * Some data are fetched only for specific dashboard types,
         */
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          contestService.findContestLeaderboardById(contestMetadata.id),
          contestMetadata.loggedMemberType === ContestMemberType.GUEST
            ? guestDataFetcher.fetch()
            : Promise.resolve(defaultContestContext.guest),
          contestMetadata.loggedMemberType === ContestMemberType.CONTESTANT
            ? contestantDataFetcher.fetch()
            : Promise.resolve(defaultContestContext.contestant),
          contestMetadata.loggedMemberType === ContestMemberType.JURY
            ? juryDataFetcher.fetch()
            : Promise.resolve(defaultContestContext.jury),
        ]);

        /**
         * Subscribe to real-time updates for the contest.
         * Some subscriptions are only relevant for specific dashboard types,
         */
        listener.current = await listenerService.get();
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listener.current,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          announcementListener.subscribeForContest(
            listener.current,
            contestMetadata.id,
            receiveAnnouncement,
          ),
          clarificationListener.subscribeForContest(
            listener.current,
            contestMetadata.id,
            receiveClarification,
          ),
          clarificationListener.subscribeForContestDeleted(
            listener.current,
            contestMetadata.id,
            deleteClarification,
          ),
          ...(contestMetadata.loggedMemberType === ContestMemberType.GUEST
            ? guestDataFetcher.subscribe(listener.current)
            : []),
          ...(contestMetadata.loggedMemberType === ContestMemberType.CONTESTANT
            ? contestantDataFetcher.subscribe(listener.current)
            : []),
          ...(contestMetadata.loggedMemberType === ContestMemberType.JURY
            ? juryDataFetcher.subscribe(listener.current)
            : []),
        ]);

        contestState.finish({
          contest: data[0],
          leaderboard: data[1],
          guest: data[2],
          contestant: data[3],
          jury: data[4],
        });
      } catch (error) {
        contestState.fail(error, {
          [NotFoundException.name]: () => redirect(routes.NOT_FOUND),
        });
      }
    }

    findContestMetadata();

    return () => {
      unsubscribe();
    };
  }, [contestMetadata.id, authorization?.member.type]);

  function receiveLeaderboard(leaderboard: ContestLeaderboardResponseDTO) {
    /**
     * Update leaderboard
     */
    contestState.finish((prevState) => {
      return {
        ...prevState,
        leaderboard,
      };
    });
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    /**
     * Update contest with new announcement.
     */
    contestState.finish((prevState) => {
      return {
        ...prevState,
        contest: {
          ...prevState.contest,
          announcements: [...prevState.contest.announcements, announcement],
        },
      };
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    /**
     * Update contest with new clarification.
     */
    contestState.finish((prevState) => {
      return {
        ...prevState,
        contest: {
          ...prevState.contest,
          clarifications: [...prevState.contest.clarifications, clarification],
        },
      };
    });
  }

  function deleteClarification({ id }: { id: string }) {
    /**
     * Remove clarification from contest.
     */
    contestState.finish((prevState) => {
      return {
        ...prevState,
        contest: {
          ...prevState.contest,
          clarifications: prevState.contest.clarifications.filter(
            (c) => c.id !== id,
          ),
        },
      };
    });
  }

  async function unsubscribe() {
    /**
     * Unsubscribe from all listeners to avoid memory leaks.
     */
    return listener.current?.close();
  }

  /**
   * Ensure contest data is loaded before rendering the children components.
   */
  if (contestState.isLoading) {
    return <LoadingPage />;
  }
  if (contestState.error || !contestState.data) {
    return <ErrorPage />;
  }

  return (
    <ContestContext.Provider value={contestState.data}>
      {children}
    </ContestContext.Provider>
  );
}

export const useContest = () => useContext(ContestContext);
