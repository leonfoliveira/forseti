import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { contestService, submissionService } from "@/app/_composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useLoadableState } from "@/app/_util/loadable-state";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { handleError } from "@/app/_util/error-handler";
import { routes } from "@/app/_routes";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { recalculateLeaderboard } from "@/app/contests/[slug]/_util/leaderboard-calculator";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { useGuestDataFetcher } from "@/app/contests/[slug]/_component/context/guest-data-fetcher";
import { useContestantDataFetcher } from "@/app/contests/[slug]/_component/context/contestant-data-fetcher";
import { useJuryDataFetcher } from "@/app/contests/[slug]/_component/context/jury-data-fetcher";

export enum DashboardType {
  GUEST = "GUEST",
  CONTESTANT = "CONTESTANT",
  JURY = "JURY",
}

export type ContestContextType = {
  contest: WithStatus<ContestPublicResponseDTO>;
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
  contest: {} as WithStatus<ContestPublicResponseDTO>,
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

  const guestDataFetcher = useGuestDataFetcher(contestState);
  const contestantDataFetcher = useContestantDataFetcher(contestState);
  const juryDataFetcher = useJuryDataFetcher(contestState);

  const listeners = useRef<ListenerClient[]>(null);

  /**
   * Determine the type of dashboard based on the member's type.
   */
  const dashboardType = useMemo(() => {
    switch (authorization?.member.type) {
      case MemberType.CONTESTANT:
        return DashboardType.CONTESTANT;
      case MemberType.JURY:
        return DashboardType.JURY;
      default:
        return DashboardType.GUEST;
    }
  }, [authorization?.member.type]);

  useEffect(() => {
    async function findContestMetadata() {
      contestState.start();
      try {
        await unsubscribe();

        /**
         * Fetch all necessary data for the contest in parallel.
         * Some data are fetched only for specific dashboard types,
         */
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          contestService.findContestLeaderboardById(contestMetadata.id),
          dashboardType === DashboardType.GUEST
            ? guestDataFetcher.fetch()
            : Promise.resolve(defaultContestContext.guest),
          dashboardType === DashboardType.CONTESTANT
            ? contestantDataFetcher.fetch()
            : Promise.resolve(defaultContestContext.contestant),
          dashboardType === DashboardType.JURY
            ? juryDataFetcher.fetch()
            : Promise.resolve(defaultContestContext.jury),
        ]);

        /**
         * Subscribe to real-time updates for the contest.
         * Some subscriptions are only relevant for specific dashboard types,
         */
        listeners.current = await Promise.all([
          submissionService.subscribeForContest(
            contestMetadata.id,
            receiveSubmission,
          ),
          ...(dashboardType === DashboardType.GUEST
            ? guestDataFetcher.subscribe()
            : []),
          ...(dashboardType === DashboardType.CONTESTANT
            ? contestantDataFetcher.subscribe()
            : []),
          ...(dashboardType === DashboardType.JURY
            ? juryDataFetcher.subscribe()
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
        contestState.fail(error);
        handleError(error, {
          [NotFoundException.name]: () => redirect(routes.NOT_FOUND),
        });
      }
    }

    findContestMetadata();

    return () => {
      unsubscribe();
    };
  }, [contestMetadata.id, authorization?.member.type]);

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    /**
     * Update leaderboard with the new submission.
     */
    contestState.finish((prevState) => {
      return {
        ...prevState,
        leaderboard: recalculateLeaderboard(prevState.leaderboard, submission),
      };
    });
  }

  async function unsubscribe() {
    /**
     * Unsubscribe from all listeners to avoid memory leaks.
     */
    if (listeners.current) {
      return await Promise.all(
        listeners.current.map((listener) => listener.unsubscribe()),
      );
    }
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
