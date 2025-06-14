import React, { createContext, useContext, useEffect } from "react";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";
import { contestService } from "@/app/_composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useLoadableState } from "@/app/_util/loadable-state";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { handleError } from "@/app/_util/error-handler";
import { routes } from "@/app/_routes";

const ContestMetadataContext = createContext(
  {} as WithStatus<ContestMetadataResponseDTO>,
);

export function ContestMetadataProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const metadataState = useLoadableState<
    WithStatus<ContestMetadataResponseDTO>
  >({ isLoading: true });

  useEffect(() => {
    /**
     * Fetches basic information from the contest
     * These are the only information that can be fetched before the contest starts
     */
    async function findContestMetadata() {
      metadataState.start();
      try {
        const contest = await contestService.findContestMetadataBySlug(slug);
        metadataState.finish(contest);
      } catch (error) {
        metadataState.fail(error);
        handleError(error, {
          [NotFoundException.name]: () => redirect(routes.NOT_FOUND),
        });
      }
    }

    findContestMetadata();
  }, [slug]);

  /**
   * Ensure contest metadata is loaded before rendering the children components.
   */
  if (metadataState.isLoading) {
    return <LoadingPage />;
  }
  if (metadataState.error || !metadataState.data) {
    return <ErrorPage />;
  }

  return (
    <ContestMetadataContext.Provider value={metadataState.data}>
      {children}
    </ContestMetadataContext.Provider>
  );
}

export const useContestMetadata = () => useContext(ContestMetadataContext);
