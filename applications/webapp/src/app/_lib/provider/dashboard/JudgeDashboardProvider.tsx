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
import { JudgeDashboardWebSocketRoom } from "@/port/output/websocket/room/dashboard/JudgeDashboardWebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

/**
 * Provider component for fetching judge dashboard data and setting up broadcast listeners.
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
      console.debug("Setting up broadcast listeners");

      try {
        await Composition.webSocketClient.connect(
          () => setListenerStatus(ListenerStatus.FAILURE),
          () => setListenerStatus(ListenerStatus.CONNECTED),
        );
        await Composition.webSocketClient.join(
          new JudgeDashboardWebSocketRoom(contest.id, {
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
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
      if (Composition.webSocketClient.isConnected) {
        Composition.webSocketClient.disconnect();
        setListenerStatus(ListenerStatus.DISCONNECTED);
      }
    };
  }, [session, contest.id]);

  function receiveLeaderboardPartial(leaderboard: LeaderboardCellResponseDTO) {
    console.debug("Received leaderboard cell update:", leaderboard);
    dispatch(JudgeDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionWithCodeResponseDTO) {
    console.debug("Received submission:", submission);
    dispatch(JudgeDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error("New failed submission");
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
      {listenerStatus === ListenerStatus.FAILURE && <DisconnectionBanner />}
      {children}
    </>
  );
}
