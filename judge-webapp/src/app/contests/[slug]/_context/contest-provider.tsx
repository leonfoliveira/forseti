import React, { useEffect } from "react";

import { ErrorPage } from "@/app/_component/page/error-page";
import { LoadingPage } from "@/app/_component/page/loading-page";
import { useLoadableState } from "@/app/_util/loadable-state";
import { contestService } from "@/config/composition";
import { contestSlice } from "@/store/slices/contest-slice";
import { useAppDispatch } from "@/store/store";

export function ContestProvider({
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
        dispatch(contestSlice.actions.set(contest));
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
