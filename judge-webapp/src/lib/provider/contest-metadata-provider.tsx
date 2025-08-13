import React, { useEffect } from "react";

import { useLoadableState } from "@/app/_util/loadable-state";
import { contestService } from "@/config/composition";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { contestMetadataSlice } from "@/store/slices/contest-metadata-slice";
import { useAppDispatch } from "@/store/store";

export function ContestMetadataProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const metadataState = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();

  useEffect(() => {
    /**
     * Fetches basic information from the contest
     * These are the only information that can be fetched before the contest starts
     */
    async function findContestMetadata() {
      metadataState.start();
      try {
        const contest = await contestService.findContestMetadataBySlug(slug);
        dispatch(contestMetadataSlice.actions.set(contest));
        metadataState.finish();
      } catch (error) {
        metadataState.fail(error);
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
  if (metadataState.error) {
    return <ErrorPage />;
  }

  return children;
}
