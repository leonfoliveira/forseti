import { notFound } from "next/navigation";
import React from "react";

import { Footer } from "@/app/_lib/component/footer";
import { Header } from "@/app/_lib/component/header";
import { StoreProvider } from "@/app/_store/store-provider";
import { sessionReader, contestReader } from "@/config/composition";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";

export const dynamic = "force-dynamic";

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

    return (
      <StoreProvider preloadedState={{ session, contestMetadata }}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
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
