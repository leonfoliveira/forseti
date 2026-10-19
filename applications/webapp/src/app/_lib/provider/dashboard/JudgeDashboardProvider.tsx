import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/DisconnectionBanner";
import { ErrorPage } from "@/app/_lib/component/page/ErrorPage";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";
import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { JudgeDashboardSlice } from "@/app/_lib/store/slice/dashboard/JudgeDashboardSlice";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { FreezeBanner } from "@/app/_lib/component/feedback/FreezeBanner";

/**
 * Provider component for fetching judge dashboard data and setting up sse listeners.
 * Failures in setting up listeners will not cause the entire provider to fail, but will show a disconnection banner and attempt to reconnect.
 */
export function JudgeDashboardProvider({
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

  const [listenerStatus, setListenerStatus] = React.useState<ListenerStatus>(
    ListenerStatus.DISCONNECTED,
  );

  useEffect(() => {
    async function setupBroadcastListeners() {
      console.debug("Setting up sse listeners");

      try {
        await Composition.judgeDashboardRoomListener.subscribe(
          contest.id,
          {
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
            ANNOUNCEMENT_CREATED: receiveAnnouncement,
            CLARIFICATION_CREATED: receiveClarificationCreated,
            CLARIFICATION_ANSWERED: receiveClarificationAnswered,
            CLARIFICATION_PUBLISHED: receiveClarificationPublished,
            CONTEST_FROZEN: receiveContestFrozen,
            CONTEST_UNFROZEN: receiveContestUnfrozen,
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

    async function fetch() {
      console.debug("Fetching dashboard data");
      const data = await Composition.dashboardReader.getJudgeDashboard(
        contest.id,
      );
      dispatch(JudgeDashboardSlice.actions.set(data));
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
      Composition.judgeDashboardRoomListener.unsubscribe();
      setListenerStatus(ListenerStatus.DISCONNECTED);
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard cell update:", leaderboard);
    dispatch(JudgeDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveSubmission(
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) {
    console.debug("Received submission:", submission);
    dispatch(JudgeDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error("New failed submission");
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(JudgeDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning(`New announcement: ${announcement.text}`);
    }
  }

  function receiveClarificationCreated(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification created:", clarification);
    dispatch(JudgeDashboardSlice.actions.mergeClarification(clarification));
    toast.info(`New clarification created`);
  }

  function receiveClarificationAnswered(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification answered:", clarification);
    dispatch(JudgeDashboardSlice.actions.mergeClarification(clarification));
  }

  function receiveClarificationPublished(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification published:", clarification);
    dispatch(JudgeDashboardSlice.actions.mergeClarification(clarification));
    toast.info(`A clarification has been published`);
  }

  function receiveContestFrozen() {
    console.debug("Received contest frozen");
    dispatch(JudgeDashboardSlice.actions.freeze());
    toast.info("The contest has been frozen");
  }

  function receiveContestUnfrozen(data: {
    leaderboard: LeaderboardResponseDTO;
    submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
  }) {
    console.debug("Received contest unfrozen");
    dispatch(JudgeDashboardSlice.actions.unfreeze(data));
    toast.info("The contest has been unfrozen");
  }

  if (state.isLoading) {
    return <LoadingPage />;
  }
  if (state.error) {
    return <ErrorPage />;
  }

  return (
    <>
      {contest.isFrozen && <FreezeBanner />}
      {listenerStatus === ListenerStatus.FAILURE && <DisconnectionBanner />}
      {children}
    </>
  );
}
