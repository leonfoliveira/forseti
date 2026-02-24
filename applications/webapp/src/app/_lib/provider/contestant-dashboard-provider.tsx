import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useIntl } from "@/app/_lib/hook/intl-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { balloonSlice } from "@/app/_store/slices/balloon-slice";
import { contestantDashboardSlice } from "@/app/_store/slices/contestant-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  problemAnswer: {
    id: "app._lib.provider.contestant-dashboard-provider.problem-answer",
    defaultMessage: "Problem {letter}: {answer}",
  },
  announcement: {
    id: "app._lib.provider.contestant-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  clarificationAnswer: {
    id: "app._lib.provider.contestant-dashboard-provider.clarification-answer",
    defaultMessage: "New answer for a clarification",
  },
  frozen: {
    id: "app._lib.provider.contestant-dashboard-provider.frozen",
    defaultMessage: "Leaderboard has been frozen",
  },
  unfrozen: {
    id: "app._lib.provider.contestant-dashboard-provider.unfrozen",
    defaultMessage: "Leaderboard has been unfrozen",
  },
  ticketUpdated: {
    id: "app._lib.provider.contestant-dashboard-provider.ticket-updated",
    defaultMessage: "Your ticket has been updated to ''{status}''",
  },
});

/**
 * Provider component for fetching contestant dashboard data and setting up listeners.
 */
export function ContestantDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contest = useAppSelector((state) => state.contest);
  const listenerStatus = useAppSelector(
    (state) => state.contestantDashboard.listenerStatus,
  );
  const isFrozen = useAppSelector(
    (state) => state.contestantDashboard.leaderboard?.isFrozen,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const intl = useIntl();
  const listenerClientRef = React.useRef<ListenerClient | null>(null);
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
      const data = await Composition.dashboardReader.getContestantDashboard(
        contest.id,
      );

      listenerClientRef.current = Composition.listenerClientFactory.create();
      await listenerClientRef.current.connect(() => {
        console.debug("Listener connection lost");
        dispatch(
          contestantDashboardSlice.actions.setListenerStatus(
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
        Composition.submissionListener.subscribeForContest(
          listenerClientRef.current,
          contest.id,
          receiveSubmission,
        ),
        Composition.submissionListener.subscribeForMemberWithCode(
          listenerClientRef.current,
          contest.id,
          session!.member.id,
          receiveMemberSubmission,
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
        Composition.clarificationListener.subscribeForMemberAnswer(
          listenerClientRef.current,
          contest.id,
          session!.member.id,
          receiveClarificationAnswer,
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
      dispatch(contestantDashboardSlice.actions.set(data));
      dispatch(
        contestantDashboardSlice.actions.setListenerStatus(
          ListenerStatus.CONNECTED,
        ),
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
      if (listenerClientRef.current) {
        listenerClientRef.current.disconnect();
      }
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard partial update:", leaderboard);
    dispatch(contestantDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveLeaderboardFreeze() {
    dispatch(contestantDashboardSlice.actions.setLeaderboardIsFrozen(true));
    toast.info(messages.frozen);
  }

  function receiveLeaderboardUnfreeze(data: {
    leaderboard: LeaderboardResponseDTO;
    frozenSubmissions: SubmissionResponseDTO[];
  }) {
    console.debug("Received leaderboard unfreeze:", data);
    dispatch(contestantDashboardSlice.actions.setLeaderboard(data.leaderboard));
    dispatch(
      contestantDashboardSlice.actions.mergeSubmissionBatch(
        data.frozenSubmissions,
      ),
    );
    toast.info(messages.unfrozen);
  }

  function receiveSubmission(submission: SubmissionResponseDTO) {
    console.debug("Received submission:", submission);
    dispatch(contestantDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveMemberSubmission(submission: SubmissionWithCodeResponseDTO) {
    console.debug("Received member submission:", submission);
    if (submission.answer === SubmissionAnswer.NO_ANSWER) {
      return;
    }

    dispatch(
      contestantDashboardSlice.actions.mergeMemberSubmission(submission),
    );

    const text = {
      ...messages.problemAnswer,
      values: {
        letter: submission.problem.letter,
        answer: intl.formatMessage(
          globalMessages.submissionAnswer[submission.answer],
        ),
      },
    };

    switch (submission.answer) {
      case SubmissionAnswer.ACCEPTED: {
        toast.success(text);
        dispatch(
          balloonSlice.actions.addBalloon({ color: submission.problem.color }),
        );
        break;
      }
      case SubmissionAnswer.WRONG_ANSWER: {
        toast.error(text);
        break;
      }
      case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
      case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED: {
        toast.info(text);
        break;
      }
      case SubmissionAnswer.RUNTIME_ERROR:
      case SubmissionAnswer.COMPILATION_ERROR: {
        toast.warning(text);
        break;
      }
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(contestantDashboardSlice.actions.mergeAnnouncement(announcement));
    toast.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    console.debug("Received clarification:", clarification);
    dispatch(
      contestantDashboardSlice.actions.mergeClarification(clarification),
    );
  }

  function receiveClarificationAnswer() {
    console.debug("Received clarification answer");
    toast.info(messages.clarificationAnswer);
  }

  function deleteClarification({ id }: { id: string }) {
    console.debug("Received clarification deletion:", id);
    dispatch(contestantDashboardSlice.actions.deleteClarification(id));
  }

  function receiveMemberTicket(memberTicket: TicketResponseDTO) {
    console.debug("Received member ticket:", memberTicket);
    dispatch(contestantDashboardSlice.actions.mergeMemberTicket(memberTicket));

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
