import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useDashboardReseter } from "@/app/_lib/hook/dashboard-reseter-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { guestDashboardSlice } from "@/app/_store/slices/guest-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { GuestDashboardBroadcastRoom } from "@/core/port/driven/broadcast/room/dashboard/GuestDashboardBroadcastRoom";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { defineMessages } from "@/i18n/message";

/**
 * Provider component for fetching guest dashboard data and setting up listeners.
 * Failures in setting up listeners will not cause the entire provider to fail, but will show a disconnection banner and attempt to reconnect.
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
  const contest = useAppSelector((state) => state.contest);
  const isFrozen = useAppSelector(
    (state) => state.guestDashboard.leaderboard?.isFrozen,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const dashboardReseter = useDashboardReseter();

  const [listenerStatus, setListenerStatus] = React.useState<ListenerStatus>(
    ListenerStatus.DISCONNECTED,
  );

  useEffect(() => {
    async function setupBroadcastListeners() {
      console.debug("Setting up broadcast listeners");

      try {
        await Composition.broadcastClient.connect(
          () => setListenerStatus(ListenerStatus.FAILURE),
          () => setListenerStatus(ListenerStatus.CONNECTED),
        );

        await Composition.broadcastClient.join(
          new GuestDashboardBroadcastRoom(contest.id, {
            ANNOUNCEMENT_CREATED: receiveAnnouncement,
            CLARIFICATION_CREATED: receiveClarification,
            CLARIFICATION_DELETED: deleteClarification,
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            LEADERBOARD_FROZEN: receiveLeaderboardFreeze,
            LEADERBOARD_UNFROZEN: receiveLeaderboardUnfreeze,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
          }),
        );

        console.debug("Successfully set up broadcast listeners");
        setListenerStatus(ListenerStatus.CONNECTED);
      } catch (error) {
        console.error("Failed to set up broadcast listeners:", error);
        setListenerStatus(ListenerStatus.FAILURE);
      }
    }

    async function fetch() {
      console.debug("Fetching dashboard data");
      const data = await Composition.dashboardReader.getGuestDashboard(
        contest.id,
      );
      dispatch(guestDashboardSlice.actions.set(data));
      console.debug("Successfully fetched dashboard data");
    }

    async function init() {
      state.start();
      try {
        dashboardReseter.reset();
        await fetch();
        await setupBroadcastListeners();
        state.finish();
      } catch (error) {
        await state.fail(error as Error);
      }
    }

    init();

    return () => {
      if (Composition.broadcastClient.isConnected) {
        Composition.broadcastClient.disconnect();
      }
      setListenerStatus(ListenerStatus.DISCONNECTED);
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard cell update:", leaderboard);
    dispatch(guestDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveLeaderboardFreeze() {
    console.debug("Received leaderboard freeze");
    dispatch(guestDashboardSlice.actions.setLeaderboardIsFrozen(true));
    toast.info(messages.frozen);
  }

  function receiveLeaderboardUnfreeze(data: {
    leaderboard: LeaderboardResponseDTO;
    frozenSubmissions: SubmissionResponseDTO[];
  }) {
    console.debug("Received leaderboard unfreeze:", data);
    dispatch(guestDashboardSlice.actions.setLeaderboard(data.leaderboard));
    dispatch(
      guestDashboardSlice.actions.mergeSubmissionBatch(data.frozenSubmissions),
    );
    toast.info(messages.unfrozen);
  }

  function receiveSubmission(submission: SubmissionResponseDTO) {
    console.debug("Received submission:", submission);
    dispatch(guestDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(guestDashboardSlice.actions.mergeAnnouncement(announcement));
    toast.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    console.debug("Received clarification:", clarification);
    dispatch(guestDashboardSlice.actions.mergeClarification(clarification));
  }

  function deleteClarification({ id }: { id: string }) {
    console.debug("Received clarification deletion:", id);
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
      {listenerStatus === ListenerStatus.FAILURE && <DisconnectionBanner />}
      {children}
    </>
  );
}
