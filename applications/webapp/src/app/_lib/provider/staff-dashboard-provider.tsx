import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useIntl } from "@/app/_lib/hook/intl-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { staffDashboardSlice } from "@/app/_store/slices/staff-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { StaffDashboardBroadcastRoom } from "@/core/port/driven/broadcast/room/dashboard/StaffDashboardBroadcastRoom";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

/**
 * Provider component for fetching staff dashboard data and setting up listeners.
 */
const messages = defineMessages({
  announcement: {
    id: "app._lib.provider.staff-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  frozen: {
    id: "app._lib.provider.staff-dashboard-provider.frozen",
    defaultMessage: "Leaderboard has been frozen",
  },
  unfrozen: {
    id: "app._lib.provider.staff-dashboard-provider.unfrozen",
    defaultMessage: "Leaderboard has been unfrozen",
  },
  newTicket: {
    id: "app._lib.provider.staff-dashboard-provider.new-ticket",
    defaultMessage: "New ticket",
  },
  ticketUpdated: {
    id: "app._lib.provider.staff-dashboard-provider.ticket-updated",
    defaultMessage: "Your ticket has been updated to ''{status}''",
  },
});

export function StaffDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contest = useAppSelector((state) => state.contest);
  const listenerStatus = useAppSelector(
    (state) => state.staffDashboard.listenerStatus,
  );
  const isFrozen = useAppSelector(
    (state) => state.staffDashboard.leaderboard?.isFrozen,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const intl = useIntl();
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
      const data = await Composition.dashboardReader.getStaffDashboard(
        contest.id,
      );

      await Composition.broadcastClient.connect(() => {
        console.debug("Listener connection lost");
        dispatch(
          staffDashboardSlice.actions.setListenerStatus(
            ListenerStatus.LOST_CONNECTION,
          ),
        );
        reconnect();
      });
      await Composition.broadcastClient.subscribe(
        new StaffDashboardBroadcastRoom(contest.id, {
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

      console.debug("Successfully fetched dashboard data and set up listeners");
      dispatch(staffDashboardSlice.actions.set(data));
      dispatch(
        staffDashboardSlice.actions.setListenerStatus(ListenerStatus.CONNECTED),
      );
    }

    async function fetch() {
      state.start();
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
      if (Composition.broadcastClient.isConnected) {
        Composition.broadcastClient.disconnect();
      }
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard cell update:", leaderboard);
    dispatch(staffDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveLeaderboardFreeze() {
    console.debug("Received leaderboard freeze");
    dispatch(staffDashboardSlice.actions.setLeaderboardIsFrozen(true));
    toast.info(messages.frozen);
  }

  function receiveLeaderboardUnfreeze(leaderboard: LeaderboardResponseDTO) {
    console.debug("Received leaderboard unfreeze:", leaderboard);
    dispatch(staffDashboardSlice.actions.setLeaderboard(leaderboard));
    toast.info(messages.unfrozen);
  }

  function receiveSubmission(submission: SubmissionResponseDTO) {
    console.debug("Received submission:", submission);
    dispatch(staffDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(staffDashboardSlice.actions.mergeAnnouncement(announcement));
    toast.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    console.debug("Received clarification:", clarification);
    dispatch(staffDashboardSlice.actions.mergeClarification(clarification));
  }

  function deleteClarification({ id }: { id: string }) {
    console.debug("Received clarification deletion:", id);
    dispatch(staffDashboardSlice.actions.deleteClarification(id));
  }

  function receiveTicket(ticket: TicketResponseDTO) {
    console.debug("Received ticket:", ticket);
    dispatch(staffDashboardSlice.actions.mergeTicket(ticket));

    if (ticket.member.id !== session?.member.id && ticket.version === 1) {
      toast.info(messages.newTicket);
    }

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
      {listenerStatus === ListenerStatus.LOST_CONNECTION && (
        <DisconnectionBanner />
      )}
      {children}
    </>
  );
}
