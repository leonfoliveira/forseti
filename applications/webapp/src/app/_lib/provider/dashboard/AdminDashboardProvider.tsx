import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/DisconnectionBanner";
import { ErrorPage } from "@/app/_lib/component/page/ErrorPage";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";
import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { AdminDashboardWebSocketRoom } from "@/port/output/websocket/room/dashboard/AdminDashboardWebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

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
          new AdminDashboardWebSocketRoom(contest.id, {
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
            ANNOUNCEMENT_CREATED: receiveAnnouncement,
            CLARIFICATION_CREATED: receiveClarificationCreated,
            CLARIFICATION_ANSWERED: receiveClarificationAnswered,
            CLARIFICATION_PUBLISHED: receiveClarificationPublished,
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
      dispatch(AdminDashboardSlice.actions.set(data));
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
    dispatch(AdminDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveSubmission(
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) {
    console.debug("Received submission:", submission);
    dispatch(AdminDashboardSlice.actions.mergeSubmission(submission));

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error("New failed submission");
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(AdminDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning(`New announcement: ${announcement.text}`);
    }
  }

  function receiveClarificationCreated(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification created:", clarification);
    dispatch(AdminDashboardSlice.actions.mergeClarification(clarification));
    toast.info(`New clarification created`);
  }

  function receiveClarificationAnswered(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification answered:", clarification);
    dispatch(AdminDashboardSlice.actions.mergeClarification(clarification));
  }

  function receiveClarificationPublished(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification published:", clarification);
    dispatch(AdminDashboardSlice.actions.mergeClarification(clarification));
    toast.info(`A clarification has been published`);
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
