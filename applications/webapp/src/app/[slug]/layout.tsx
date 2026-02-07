import { notFound } from "next/navigation";
import React from "react";

import { Footer } from "@/app/_lib/component/footer";
import { Header } from "@/app/_lib/component/header";
import { StoreProvider } from "@/app/_store/store-provider";
import { sessionReader, contestReader } from "@/config/composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";

export const dynamic = "force-dynamic";

/**
 * Layout component for contest pages.
 * Fetches session and contest metadata based on the slug parameter.
 * Renders the header, footer, and children components within a store provider.
 *
 * ! This component runs on the server side.
 */
export default async function ContestLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;

  try {
    const [session, contestMetadata] = await Promise.all([
      sessionReader.getCurrent(),
      contestReader.findMetadataBySlug(slug),
    ]);

    const doesSessionBelongToContest =
      session?.contest?.id === contestMetadata.id;

    return (
      <StoreProvider
        preloadedState={{
          session: doesSessionBelongToContest ? session : undefined,
          contestMetadata,
        }}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </div>
      </StoreProvider>
    );
  } catch (error) {
    if (error instanceof NotFoundException) {
      return notFound();
    }
    console.error("Error while fetching contest data: ", error);
    throw error;
  }
}
