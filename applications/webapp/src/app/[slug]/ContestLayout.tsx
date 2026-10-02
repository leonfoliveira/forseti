"use client";

import { redirect, usePathname } from "next/navigation";
import React, { useEffect } from "react";

import { Footer } from "@/app/_lib/component/layout/Footer";
import { Header } from "@/app/_lib/component/layout/Header";
import { ErrorPage } from "@/app/_lib/component/page/ErrorPage";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";
import { useErrorHandlerRoot } from "@/app/_lib/hook/useErrorHandler";
import { useLoadableStateRoot } from "@/app/_lib/hook/useLoadableState";
import { StoreProvider } from "@/app/_lib/store/StoreProvider";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/domain/exception/NotFoundException";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

/**
 * Layout component for contest pages.
 * Fetches session and contest metadata based on the slug parameter.
 * Renders the header, footer, and children components within a store provider.
 */
export default function ContestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useParams() would return the build-time placeholder in a static export
  const slug = usePathname().split("/")[1];
  const errorHandler = useErrorHandlerRoot(slug);
  const initState = useLoadableStateRoot<{
    session: SessionResponseDTO | null;
    contest: ContestResponseDTO;
  }>(errorHandler, { isLoading: true });

  useEffect(() => {
    async function fetchData() {
      console.debug("Fetching session and contest data for slug:", slug);
      initState.start();

      try {
        const [session, contest] = await Promise.all([
          Composition.sessionReader.getCurrent(),
          Composition.contestReader.findBySlug(slug),
        ]);

        initState.finish({ session, contest });
        console.debug("Fetched session and contest data:", {
          session,
          contest,
        });
      } catch (error) {
        await initState.fail(error, {
          [NotFoundException.name]: () => redirect(routes.NOT_FOUND),
        });
      }
    }

    fetchData();
  }, [slug]);

  if (initState.isLoading) {
    return <LoadingPage />;
  }

  if (initState.error) {
    return <ErrorPage />;
  }

  const memberContestId = initState.data?.session?.member?.contestId;
  const doesMemberBelongToContest =
    !memberContestId || memberContestId === initState.data?.contest?.id;

  return (
    <StoreProvider
      preloadedState={{
        session: doesMemberBelongToContest
          ? initState.data?.session
          : undefined,
        contest: initState.data?.contest,
      }}
    >
      <div className="bg-muted flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    </StoreProvider>
  );
}
