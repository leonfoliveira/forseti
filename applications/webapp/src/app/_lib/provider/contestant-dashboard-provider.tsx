import React, { useEffect } from "react";

import { DisconnectionAlert } from "@/app/_lib/component/feedback/disconnection-alert";
import { ErrorPage } from "@/app/_lib/component/page/error-page";
import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { useIntl } from "@/app/_lib/hook/intl-hook";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { contestantDashboardSlice } from "@/app/_store/slices/contestant-dashboard-slice";
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
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
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
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const listenerStatus = useAppSelector(
    (state) => state.contestantDashboard.listenerStatus,
  );
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const intl = useIntl();
  const listenerClientRef = React.useRef<ListenerClient | null>(null);
  const reconnectIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    state.start();

    function stopReconnection() {
      console.debug("Stopping reconnection attempts");
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
    }

    function startReconnection() {
      console.debug("Starting reconnection attempts");
      stopReconnection();
      reconnectIntervalRef.current = setInterval(() => {
        fetch();
      }, 1000);
    }

    async function fetch() {
      try {
        const data = await dashboardReader.getContestant(contestMetadata.id);

        listenerClientRef.current = listenerClientFactory.create();
        await listenerClientRef.current.connect(() => {
          console.debug("Listener connection lost");
          dispatch(
            contestantDashboardSlice.actions.setListenerStatus(
              ListenerStatus.LOST_CONNECTION,
            ),
          );
          startReconnection();
        });
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listenerClientRef.current,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          submissionListener.subscribeForContest(
            listenerClientRef.current,
            contestMetadata.id,
            receiveSubmission,
          ),
          submissionListener.subscribeForMemberFull(
            listenerClientRef.current,
            contestMetadata.id,
            session!.member.id,
            receiveMemberSubmission,
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
          clarificationListener.subscribeForMemberChildren(
            listenerClientRef.current,
            contestMetadata.id,
            session!.member.id,
            receiveClarificationAnswer,
          ),
          clarificationListener.subscribeForContestDeleted(
            listenerClientRef.current,
            contestMetadata.id,
            deleteClarification,
          ),
        ]);

        console.debug(
          "Successfully fetched dashboard data and set up listeners",
        );
        dispatch(contestantDashboardSlice.actions.set(data));
        dispatch(
          contestantDashboardSlice.actions.setListenerStatus(
            ListenerStatus.CONNECTED,
          ),
        );
        stopReconnection();
        state.finish();
      } catch (error) {
        await state.fail(error as Error);
      }
    }

    fetch();

    return () => {
      stopReconnection();
      if (listenerClientRef.current) {
        listenerClientRef.current.disconnect();
      }
    };
  }, [session, contestMetadata.id]);

  function receiveLeaderboard(leaderboard: LeaderboardResponseDTO) {
    dispatch(contestantDashboardSlice.actions.setLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    dispatch(contestantDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveMemberSubmission(submission: SubmissionPublicResponseDTO) {
    if (submission.answer === SubmissionAnswer.NO_ANSWER) {
      return;
    }

    dispatch(
      contestantDashboardSlice.actions.mergeMemberSubmission(
        submission as SubmissionFullResponseDTO,
      ),
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
    dispatch(contestantDashboardSlice.actions.mergeAnnouncement(announcement));
    toast.warning({
      ...messages.announcement,
      values: { text: announcement.text },
    });
  }

  function receiveClarification(clarification: ClarificationResponseDTO) {
    dispatch(
      contestantDashboardSlice.actions.mergeClarification(clarification),
    );
  }

  function receiveClarificationAnswer() {
    toast.info(messages.clarificationAnswer);
  }

  function deleteClarification({ id }: { id: string }) {
    dispatch(contestantDashboardSlice.actions.deleteClarification(id));
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
