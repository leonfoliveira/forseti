import React, { useEffect } from "react";

import { DisconnectionAlert } from "@/app/_lib/component/feedback/disconnection-alert";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import {
  announcementListener,
  clarificationListener,
  dashboardReader,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  submissionFailed: {
    id: "app._lib.provider.judge-dashboard-provider.submission-failed",
    defaultMessage: "New failed submission",
  },
  announcement: {
    id: "app._lib.provider.judge-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  newClarification: {
    id: "app._lib.provider.judge-dashboard-provider.new-clarification",
    defaultMessage: "New clarification",
  },
});

/**
 * Provider component for fetching judge dashboard data and setting up listeners.
 */
export function JudgeDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const listenerStatus = useAppSelector(
    (state) => state.judgeDashboard.listenerStatus,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const listenerClientRef = React.useRef<ListenerClient | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    state.start();

    async function reconnect() {
      try {
        console.debug("Attempting to reconnect...");
        await init();
      } catch {
        console.debug("Reconnection attempt failed");
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnect();
        }, 1000);
      }
    }

    async function init() {
      const data = await dashboardReader.getJudge(contestMetadata.id);

      listenerClientRef.current = listenerClientFactory.create();
      await listenerClientRef.current.connect(() => {
        console.debug("Listener connection lost");
        dispatch(
          judgeDashboardSlice.actions.setListenerStatus(
            ListenerStatus.LOST_CONNECTION,
          ),
        );
        reconnect();
      });
      await Promise.all([
        leaderboardListener.subscribeForLeaderboard(
          listenerClientRef.current,
          contestMetadata.id,
          receiveLeaderboard,
        ),
        leaderboardListener.subscribeForLeaderboardPartial(
          listenerClientRef.current,
          contestMetadata.id,
          receiveLeaderboardPartial,
        ),
        submissionListener.subscribeForContestFull(
          listenerClientRef.current,
          contestMetadata.id,
          receiveSubmission,
        ),
        announcementListener.subscribeForContest(
          listenerClientRef.current,
          contestMetadata.id,
          receiveAnnouncement,
        ),
        clarificationListener.subscribeForContest(
          listenerClientRef.current,
          contestMetadata.id,
          receiveClarification,
        ),
        clarificationListener.subscribeForContestDeleted(
          listenerClientRef.current,
          contestMetadata.id,
          deleteClarification,
        ),
      ]);

      console.debug("Successfully fetched dashboard data and set up listeners");
      dispatch(judgeDashboardSlice.actions.set(data));
      dispatch(
        judgeDashboardSlice.actions.setListenerStatus(ListenerStatus.CONNECTED),
      );
    }

    async function fetch() {
      try {
        await init();
        state.finish();
      } catch (error) {
        await state.fail(error);
      }
    }

    fetch();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (listenerClientRef.current) {
        listenerClientRef.current.disconnect();
      }
    };
  }, [session, contestMetadata.id]);

  function receiveLeaderboard(leaderboard: LeaderboardResponseDTO) {
    dispatch(judgeDashboardSlice.actions.setLeaderboard(leaderboard));
  }

  function receiveLeaderboardPartial(
    leaderboard: LeaderboardPartialResponseDTO,
  ) {
    dispatch(judgeDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionFullResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(messages.submissionFailed);
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning({
        ...messages.announcement,
        values: { text: announcement.text },
      });
    }
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(judgeDashboardSlice.actions.mergeClarification(clarification));
    if (!clarification.parentId) {
      toast.info(messages.newClarification);
    }
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(judgeDashboardSlice.actions.deleteClarification(id));
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return (
    <>
      {listenerStatus === ListenerStatus.LOST_CONNECTION && (
        <DisconnectionAlert />
      )}
      {children}
    </>
  );
}
