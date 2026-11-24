import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/DisconnectionBanner";
import { FreezeBanner } from "@/app/_lib/component/feedback/FreezeBanner";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { ErrorPage } from "@/app/_lib/component/page/ErrorPage";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";
import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { BalloonSlice } from "@/app/_lib/store/slice/BalloonSlice";
import { ContestSlice } from "@/app/_lib/store/slice/ContestSlice";
import { ContestantDashboardSlice } from "@/app/_lib/store/slice/dashboard/ContestantDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { I18nUtil } from "@/app/_lib/util/i18nUtil";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { ContestUtil } from "@/util/ContestUtil";

/**
 * Provider component for fetching contestant dashboard data and setting up sse listeners.
 * Failures in setting up listeners will not cause the entire provider to fail, but will show a disconnection banner and attempt to reconnect.
 */
export function ContestantDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contest = useAppSelector((state) => state.contest);
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const dashboardReseter = useDashboardReseter();
  const { t } = useTranslation();

  const [listenerStatus, setListenerStatus] = React.useState<ListenerStatus>(
    ListenerStatus.DISCONNECTED,
  );

  useEffect(() => {
    async function fetchDashboardData() {
      console.debug("Fetching dashboard data");
      const data = await Composition.dashboardReader.getContestantDashboard(
        contest.id,
      );
      dispatch(ContestantDashboardSlice.actions.set(data));
      console.debug("Successfully fetched dashboard data");
    }

    async function connectBroadcastListeners() {
      console.debug("Setting up sse listeners");

      try {
        await Composition.contestantDashboardRoomListener.subscribe(
          contest.id,
          {
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
            ANNOUNCEMENT_CREATED: receiveAnnouncement,
            CLARIFICATION_PUBLISHED: receiveClarificationPublished,
            CONTEST_UPDATED: receiveContestUpdated,
            CONTEST_FROZEN: receiveContestFrozen,
            CONTEST_UNFROZEN: receiveContestUnfrozen,
          },
          () => setListenerStatus(ListenerStatus.FAILURE),
          () => setListenerStatus(ListenerStatus.CONNECTED),
        );
        await Composition.memberPrivateRoomListener.subscribe(
          session!.member.id,
          {
            SUBMISSION_UPDATED: receiveMemberSubmission,
            CLARIFICATION_ANSWERED: receiveClarificationAnswered,
            PRINT_REQUEST_CREATED: receivePrintRequest,
            PRINT_REQUEST_UPDATED: receivePrintRequest,
          },
          () => setListenerStatus(ListenerStatus.FAILURE),
          () => setListenerStatus(ListenerStatus.CONNECTED),
        );

        console.debug("Successfully set up sse listeners");
        setListenerStatus(ListenerStatus.CONNECTED);
      } catch (error) {
        console.error("Failed to setup sse listeners:", error);
        setListenerStatus(ListenerStatus.FAILURE);
      }
    }

    async function disconnectBroadcastListeners() {
      console.debug("Disconnecting sse listeners");
      try {
        await Composition.contestantDashboardRoomListener.unsubscribe();
        await Composition.memberPrivateRoomListener.unsubscribe();
        console.debug("Successfully disconnected sse listeners");
      } catch (error) {
        console.error("Failed to disconnect sse listeners:", error);
      }
    }

    async function init() {
      state.start();
      try {
        dashboardReseter.reset();
        await fetchDashboardData();
        await connectBroadcastListeners();
        state.finish();
        console.debug("Successfully initialized dashboard");
      } catch (error) {
        console.error("Failed to initialize dashboard:", error);
        await state.fail(error as Error);
      }
    }

    init();

    return () => {
      disconnectBroadcastListeners();
      setListenerStatus(ListenerStatus.DISCONNECTED);
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard cell update:", leaderboard);
    dispatch(ContestantDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionResponseDTO) {
    console.debug("Received submission:", submission);
    dispatch(ContestantDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveMemberSubmission(submission: SubmissionWithCodeResponseDTO) {
    console.debug("Received member submission:", submission);
    if (!submission.answer) {
      return;
    }

    dispatch(
      ContestantDashboardSlice.actions.mergeMemberSubmission(submission),
    );

    switch (submission.answer) {
      case SubmissionAnswer.ACCEPTED: {
        toast.success(
          "_lib.provider.dashboard.ContestDashboardProvider.memberSubmissionUpdate",
          {
            letter: submission.problem.letter,
            answer: t(I18nUtil.getSubmissionAnswer(submission.answer)),
          },
        );
        dispatch(
          BalloonSlice.actions.addBalloon({ color: submission.problem.color }),
        );
        break;
      }
      case SubmissionAnswer.WRONG_ANSWER: {
        toast.error(
          "_lib.provider.dashboard.ContestDashboardProvider.memberSubmissionUpdate",
          {
            letter: submission.problem.letter,
            answer: t(I18nUtil.getSubmissionAnswer(submission.answer)),
          },
        );
        break;
      }
      case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
      case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED: {
        toast.info(
          "_lib.provider.dashboard.ContestDashboardProvider.memberSubmissionUpdate",
          {
            letter: submission.problem.letter,
            answer: t(I18nUtil.getSubmissionAnswer(submission.answer)),
          },
        );
        break;
      }
      case SubmissionAnswer.RUNTIME_ERROR:
      case SubmissionAnswer.COMPILATION_ERROR: {
        toast.warning(
          "_lib.provider.dashboard.ContestDashboardProvider.memberSubmissionUpdate",
          {
            letter: submission.problem.letter,
            answer: t(I18nUtil.getSubmissionAnswer(submission.answer)),
          },
        );
        break;
      }
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(ContestantDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning(
        "_lib.provider.dashboard.ContestDashboardProvider.newAnnouncement",
        {
          text: announcement.text,
        },
      );
    }
  }

  function receiveClarificationAnswered(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification answered:", clarification);
    dispatch(
      ContestantDashboardSlice.actions.mergeClarification(clarification),
    );
    toast.info(
      "_lib.provider.dashboard.ContestDashboardProvider.clarificationAnswered",
    );
  }

  function receiveClarificationPublished(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification published:", clarification);
    dispatch(
      ContestantDashboardSlice.actions.mergeClarification(clarification),
    );
    toast.info(
      "_lib.provider.dashboard.ContestDashboardProvider.clarificationPublished",
    );
  }

  function receiveContestUpdated(contest: ContestResponseDTO) {
    console.debug("Received contest updated:", contest);
    dispatch(ContestantDashboardSlice.actions.setContest(contest));
    dispatch(ContestSlice.actions.set(contest));
  }

  function receiveContestFrozen(contest: ContestResponseDTO) {
    console.debug("Received contest frozen:", contest);
    dispatch(ContestantDashboardSlice.actions.freeze(contest));
    toast.info(
      "_lib.provider.dashboard.ContestDashboardProvider.contestFrozen",
    );
  }

  function receiveContestUnfrozen(data: {
    contest: ContestResponseDTO;
    leaderboard: LeaderboardResponseDTO;
    submissions: SubmissionResponseDTO[];
  }) {
    console.debug("Received contest unfrozen");
    dispatch(ContestantDashboardSlice.actions.unfreeze(data));
    toast.info(
      "_lib.provider.dashboard.ContestDashboardProvider.contestUnfrozen",
    );
  }

  function receivePrintRequest(printRequest: PrintRequestResponseDTO) {
    console.debug("Received print request:", printRequest);
    dispatch(ContestantDashboardSlice.actions.mergePrintRequest(printRequest));
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return (
    <>
      {ContestUtil.isFrozen(contest) && <FreezeBanner />}
      {listenerStatus === ListenerStatus.FAILURE && <DisconnectionBanner />}
      {children}
    </>
  );
}
