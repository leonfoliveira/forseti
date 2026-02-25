import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useDashboardReseter } from "@/app/_lib/hook/dashboard-reseter-hook";
import { useIntl } from "@/app/_lib/hook/intl-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AdminDashboardBroadcastRoom } from "@/core/port/driven/broadcast/room/dashboard/AdminDashboardBroadcastRoom";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  submissionFailed: {
    id: "app._lib.provider.admin-dashboard-provider.submission-failed",
    defaultMessage: "New failed submission",
  },
  announcement: {
    id: "app._lib.provider.admin-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  frozen: {
    id: "app._lib.provider.admin-dashboard-provider.frozen",
    defaultMessage: "Leaderboard has been frozen",
  },
  unfrozen: {
    id: "app._lib.provider.admin-dashboard-provider.unfrozen",
    defaultMessage: "Leaderboard has been unfrozen",
  },
  ticketUpdated: {
    id: "app._lib.provider.admin-dashboard-provider.ticket-updated",
    defaultMessage: "Your ticket has been updated to ''{status}''",
  },
});

/**
 * Provider component for fetching admin dashboard data and setting up broadcast listeners.
 * Failures in setting up listeners will not cause the entire provider to fail, but will show a disconnection banner and attempt to reconnect.
 */
export function AdminDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contest = useAppSelector((state) => state.contest);
  const isFrozen = useAppSelector(
    (state) => state.adminDashboard.leaderboard?.isFrozen,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const intl = useIntl();
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
          new AdminDashboardBroadcastRoom(contest.id, {
            ANNOUNCEMENT_CREATED: receiveAnnouncement,
            CLARIFICATION_CREATED: receiveClarification,
            CLARIFICATION_DELETED: deleteClarification,
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            LEADERBOARD_FROZEN: receiveLeaderboardFreeze,
            LEADERBOARD_UNFROZEN: receiveLeaderboardUnfreeze,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
            TICKET_CREATED: receiveTicket,
            TICKET_UPDATED: receiveTicket,
          }),
        );

        console.debug("Successfully set up broadcast listeners");
        setListenerStatus(ListenerStatus.CONNECTED);
      } catch (error) {
        console.error("Failed to setup broadcast listeners:", error);
        setListenerStatus(ListenerStatus.FAILURE);
      }
    }

    async function fetch() {
      console.debug("Fetching dashboard data");
      const data = await Composition.dashboardReader.getAdminDashboard(
        contest.id,
      );
      dispatch(adminDashboardSlice.actions.set(data));
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
        setListenerStatus(ListenerStatus.DISCONNECTED);
      }
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard cell update:", leaderboard);
    dispatch(adminDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveLeaderboardFreeze() {
    console.debug("Received leaderboard freeze");
    dispatch(adminDashboardSlice.actions.setLeaderboardIsFrozen(true));
    toast.info(messages.frozen);
  }

  function receiveLeaderboardUnfreeze(leaderboard: LeaderboardResponseDTO) {
    console.debug("Received leaderboard unfreeze:", leaderboard);
    dispatch(adminDashboardSlice.actions.setLeaderboard(leaderboard));
    toast.info(messages.unfrozen);
  }

  function receiveSubmission(
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) {
    console.debug("Received submission:", submission);
    dispatch(adminDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(messages.submissionFailed);
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(adminDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning({
        ...messages.announcement,
        values: { text: announcement.text },
      });
    }
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    console.debug("Received clarification:", clarification);
    dispatch(adminDashboardSlice.actions.mergeClarification(clarification));
  }

  function deleteClarification({ id }: { id: string }) {
    console.debug("Received clarification deletion:", id);
    dispatch(adminDashboardSlice.actions.deleteClarification(id));
  }

  function receiveTicket(ticket: TicketResponseDTO) {
    console.debug("Received ticket:", ticket);
    dispatch(adminDashboardSlice.actions.mergeTicket(ticket));

    if (ticket.member.id === session?.member.id && ticket.version > 1) {
      toast.info({
        ...messages.ticketUpdated,
        values: {
          status: intl.formatMessage(
            globalMessages.ticketStatus[ticket.status],
          ),
        },
      });
    }
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
