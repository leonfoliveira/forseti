import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useIntl } from "@/app/_lib/hook/intl-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
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
  frozen: {
    id: "app._lib.provider.judge-dashboard-provider.frozen",
    defaultMessage: "Leaderboard has been frozen",
  },
  unfrozen: {
    id: "app._lib.provider.judge-dashboard-provider.unfrozen",
    defaultMessage: "Leaderboard has been unfrozen",
  },
  ticketUpdated: {
    id: "app._lib.provider.judge-dashboard-provider.ticket-updated",
    defaultMessage: "Your ticket has been updated to ''{status}''",
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
  const contest = useAppSelector((state) => state.contest);
  const listenerStatus = useAppSelector(
    (state) => state.judgeDashboard.listenerStatus,
  );
  const isFrozen = useAppSelector(
    (state) => state.judgeDashboard.leaderboard?.isFrozen,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const intl = useIntl();
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
      const data = await Composition.dashboardReader.getJudgeDashboard(
        contest.id,
      );

      listenerClientRef.current = Composition.listenerClientFactory.create();
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
        Composition.leaderboardListener.subscribeForLeaderboardCell(
          listenerClientRef.current,
          contest.id,
          receiveLeaderboardPartial,
        ),
        Composition.leaderboardListener.subscribeForLeaderboardFrozen(
          listenerClientRef.current,
          contest.id,
          receiveLeaderboardFreeze,
        ),
        Composition.leaderboardListener.subscribeForLeaderboardUnfrozen(
          listenerClientRef.current,
          contest.id,
          receiveLeaderboardUnfreeze,
        ),
        Composition.submissionListener.subscribeForContestWithCodeAndExecutions(
          listenerClientRef.current,
          contest.id,
          receiveSubmission,
        ),
        Composition.announcementListener.subscribeForContest(
          listenerClientRef.current,
          contest.id,
          receiveAnnouncement,
        ),
        Composition.clarificationListener.subscribeForContest(
          listenerClientRef.current,
          contest.id,
          receiveClarification,
        ),
        Composition.clarificationListener.subscribeForContestDeleted(
          listenerClientRef.current,
          contest.id,
          deleteClarification,
        ),
        Composition.ticketListener.subscribeForMember(
          listenerClientRef.current,
          contest.id,
          session!.member.id,
          receiveMemberTicket,
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
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard partial update:", leaderboard);
    dispatch(judgeDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveLeaderboardFreeze() {
    console.debug("Received leaderboard freeze");
    dispatch(judgeDashboardSlice.actions.setLeaderboardIsFrozen(true));
    toast.info(messages.frozen);
  }

  function receiveLeaderboardUnfreeze(data: {
    leaderboard: LeaderboardResponseDTO;
    frozenSubmissions: SubmissionResponseDTO[];
  }) {
    console.debug("Received leaderboard unfreeze:", data);
    dispatch(judgeDashboardSlice.actions.setLeaderboard(data.leaderboard));
    toast.info(messages.unfrozen);
  }

  function receiveSubmission(
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) {
    console.debug("Received submission:", submission);
    dispatch(judgeDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(messages.submissionFailed);
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(judgeDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning({
        ...messages.announcement,
        values: { text: announcement.text },
      });
    }
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    console.debug("Received clarification:", clarification);
    dispatch(judgeDashboardSlice.actions.mergeClarification(clarification));
    if (!clarification.parentId) {
      toast.info(messages.newClarification);
    }
  }

  function deleteClarification({ id }: { id: string }) {
    console.debug("Received clarification deletion:", id);
    dispatch(judgeDashboardSlice.actions.deleteClarification(id));
  }

  function receiveMemberTicket(memberTicket: TicketResponseDTO) {
    console.debug("Received member ticket:", memberTicket);
    dispatch(judgeDashboardSlice.actions.mergeMemberTicket(memberTicket));

    if (memberTicket.version > 1) {
      toast.info({
        ...messages.ticketUpdated,
        values: {
          status: intl.formatMessage(
            globalMessages.ticketStatus[memberTicket.status],
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
