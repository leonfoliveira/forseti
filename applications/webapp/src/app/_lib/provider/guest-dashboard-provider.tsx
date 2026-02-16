import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { guestDashboardSlice } from "@/app/_store/slices/guest-dashboard-slice";
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
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { defineMessages } from "@/i18n/message";

/**
 * Provider component for fetching guest dashboard data and setting up listeners.
 */
const messages = defineMessages({
  announcement: {
    id: "app._lib.provider.guest-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  frozen: {
    id: "app._lib.provider.guest-dashboard-provider.frozen",
    defaultMessage: "Leaderboard has been frozen",
  },
  unfrozen: {
    id: "app._lib.provider.guest-dashboard-provider.unfrozen",
    defaultMessage: "Leaderboard has been unfrozen",
  },
});

export function GuestDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const listenerStatus = useAppSelector(
    (state) => state.guestDashboard.listenerStatus,
  );
  const isFrozen = useAppSelector(
    (state) => state.guestDashboard.leaderboard?.isFrozen,
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
      const data = await dashboardReader.getGuest(contestMetadata.id);

      listenerClientRef.current = listenerClientFactory.create();
      await listenerClientRef.current.connect(() => {
        console.debug("Listener connection lost");
        dispatch(
          guestDashboardSlice.actions.setListenerStatus(
            ListenerStatus.LOST_CONNECTION,
          ),
        );
        reconnect();
      });
      await Promise.all([
        leaderboardListener.subscribeForLeaderboardPartial(
          listenerClientRef.current,
          contestMetadata.id,
          receiveLeaderboardPartial,
        ),
        leaderboardListener.subscribeForLeaderboardFreeze(
          listenerClientRef.current,
          contestMetadata.id,
          receiveLeaderboardFreeze,
        ),
        leaderboardListener.subscribeForLeaderboardUnfreeze(
          listenerClientRef.current,
          contestMetadata.id,
          receiveLeaderboardUnfreeze,
        ),
        submissionListener.subscribeForContest(
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
      dispatch(guestDashboardSlice.actions.set(data));
      dispatch(
        guestDashboardSlice.actions.setListenerStatus(ListenerStatus.CONNECTED),
      );
    }

    async function fetch() {
      try {
        await init();
        state.finish();
      } catch (error) {
        await state.fail(error as Error);
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

  function receiveLeaderboardPartial(
    leaderboard: LeaderboardPartialResponseDTO,
  ) {
    dispatch(guestDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveLeaderboardFreeze() {
    dispatch(guestDashboardSlice.actions.setLeaderboardIsFrozen(true));
    toast.info(messages.frozen);
  }

  function receiveLeaderboardUnfreeze(data: {
    leaderboard: LeaderboardResponseDTO;
    frozenSubmissions: SubmissionPublicResponseDTO[];
  }) {
    dispatch(guestDashboardSlice.actions.setLeaderboard(data.leaderboard));
    dispatch(
      guestDashboardSlice.actions.mergeSubmissionBatch(data.frozenSubmissions),
    );
    toast.info(messages.unfrozen);
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    dispatch(guestDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    dispatch(guestDashboardSlice.actions.mergeAnnouncement(announcement));
    toast.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(guestDashboardSlice.actions.mergeClarification(clarification));
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(guestDashboardSlice.actions.deleteClarification(id));
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return (
    <>
      {isFrozen && <FreezeBanner />}
      {listenerStatus === ListenerStatus.LOST_CONNECTION && (
        <DisconnectionBanner />
      )}
      {children}
    </>
  );
}
