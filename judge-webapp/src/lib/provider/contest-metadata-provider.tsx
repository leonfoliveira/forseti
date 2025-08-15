import React, { useEffect } from "react";

import { contestService } from "@/config/composition";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

export function ContestMetadataProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { isLoading, error } = useAppSelector((state) => state.contestMetadata);
  const dispatch = useAppDispatch();

  useEffect(() => {
    /**
     * Fetches basic information from the contest
     * These are the only information that can be fetched before the contest starts
     */
    async function findContestMetadata() {
      try {
        const contest = await contestService.findContestMetadataBySlug(slug);
        dispatch(contestMetadataSlice.actions.success(contest));
      } catch (error) {
        dispatch(contestMetadataSlice.actions.fail(error as Error));
      }
    }

    findContestMetadata();
  }, [slug]);

  /**
   * Ensure contest metadata is loaded before rendering the children components.
   */
  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <ErrorPage />;
  }

  return children;
}
