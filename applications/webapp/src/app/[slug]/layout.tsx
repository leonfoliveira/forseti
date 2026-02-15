"use client";

import { redirect, useParams } from "next/navigation";
import React, { useEffect } from "react";

import { Footer } from "@/app/_lib/component/layout/footer";
import { Header } from "@/app/_lib/component/layout/header";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useErrorHandlerRoot } from "@/app/_lib/hook/error-handler-hook";
import { useLoadableStateRoot } from "@/app/_lib/hook/loadable-state-hook";
import { StoreProvider } from "@/app/_store/store-provider";
import { sessionReader, contestReader } from "@/config/composition";
import { routes } from "@/config/routes";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

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
  const { slug } = useParams() as { slug: string };
  const errorHandler = useErrorHandlerRoot(slug);
  const initState = useLoadableStateRoot<{
    session: SessionResponseDTO | null;
    contestMetadata: ContestMetadataResponseDTO;
  }>(errorHandler, { isLoading: true });

  useEffect(() => {
    async function fetchData() {
      initState.start();
      try {
        const [session, contestMetadata] = await Promise.all([
          sessionReader.getCurrent(),
          contestReader.findMetadataBySlug(slug),
        ]);
        initState.finish({ session, contestMetadata });
      } catch (error) {
        await initState.fail(error, {
          [NotFoundException.name]: redirect(routes.NOT_FOUND),
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

  const doesSessionBelongToContest =
    initState.data?.session?.contest?.id ===
    initState.data?.contestMetadata?.id;

  return (
    <StoreProvider
      preloadedState={{
        session: doesSessionBelongToContest
          ? initState.data?.session
          : undefined,
        contestMetadata: initState.data?.contestMetadata,
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
