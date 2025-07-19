import React, { createContext, useContext, useEffect, useMemo } from "react";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { contestService } from "@/composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useLoadableState } from "@/app/_util/loadable-state";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { ErrorPage } from "@/app/_component/page/error-page";
import { routes } from "@/routes";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { ContestMemberType } from "@/core/domain/enumerate/ContestMemberType";
import { MemberType } from "@/core/domain/enumerate/MemberType";

type ContestMetadataContextType = ContestMetadataResponseDTO & {
  loggedMemberType?: ContestMemberType;
};

const ContestMetadataContext = createContext<ContestMetadataContextType>(
  {} as ContestMetadataContextType,
);

export function ContestMetadataProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { authorization } = useAuthorization();
  const metadataState = useLoadableState<ContestMetadataResponseDTO>({
    isLoading: true,
  });

  /**
   * Determine the type of contest member based on the authorization.
   */
  const loggedMemberType = useMemo(() => {
    if (
      !authorization ||
      authorization.member.contestId !== metadataState.data?.id
    ) {
      return ContestMemberType.GUEST;
    }
    switch (authorization.member.type) {
      case MemberType.CONTESTANT:
        return ContestMemberType.CONTESTANT;
      case MemberType.JURY:
        return ContestMemberType.JURY;
      default:
        return ContestMemberType.GUEST;
    }
  }, [
    authorization?.member.contestId,
    metadataState.data?.id,
    authorization?.member.type,
  ]);

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
        metadataState.fail(error, {
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
    <ContestMetadataContext.Provider
      value={{ ...metadataState.data, loggedMemberType }}
    >
      {children}
    </ContestMetadataContext.Provider>
  );
}

export const useContestMetadata = () => useContext(ContestMetadataContext);
