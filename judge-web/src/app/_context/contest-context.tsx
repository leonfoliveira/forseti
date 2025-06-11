import React, { createContext, useContext, useEffect } from "react";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { contestService } from "@/app/_composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useLoadableState } from "@/app/_util/loadable-state";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { handleError } from "@/app/_util/error-handler";
import { routes } from "@/app/_routes";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { useContestMetadata } from "@/app/_context/contest-metadata-context";

const ContestContext = createContext(
  {} as WithStatus<ContestPublicResponseDTO>,
);

export function ContestProvider({ children }: { children: React.ReactNode }) {
  const metadata = useContestMetadata();
  const contestState = useLoadableState<WithStatus<ContestPublicResponseDTO>>({
    isLoading: true,
  });

  useEffect(() => {
    async function findContestMetadata() {
      contestState.start();
      try {
        const contest = await contestService.findContestById(metadata.id);
        contestState.finish(contest);
      } catch (error) {
        contestState.fail(error);
        handleError(error, {
          [NotFoundException.name]: () => redirect(routes.NOT_FOUND),
        });
      }
    }

    findContestMetadata();
  }, [metadata]);

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
