import React, { useEffect } from "react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/DisconnectionBanner";
import { ErrorPage } from "@/app/_lib/component/page/ErrorPage";
import { LoadingPage } from "@/app/_lib/component/page/LoadingPage";
import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { useToast } from "@/app/_lib/hook/useToast";
import { useAppDispatch, useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { StaffDashboardSlice } from "@/app/_lib/store/slice/dashboard/StaffDashboardSlice";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { FreezeBanner } from "@/app/_lib/component/feedback/FreezeBanner";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { ContestUtil } from "@/util/ContestUtil";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";

/**
 * Provider component for fetching staff dashboard data and setting up sse listeners.
 * Failures in setting up listeners will not cause the entire provider to fail, but will show a disconnection banner and attempt to reconnect.
 */
export function StaffDashboardProvider({
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
    async function fetchDashboardData() {
      console.debug("Fetching dashboard data");
      const data = await Composition.dashboardReader.getStaffDashboard(
        contest.id,
      );
      dispatch(StaffDashboardSlice.actions.set(data));
      console.debug("Successfully fetched dashboard data");
    }

    async function connectBroadcastListeners() {
      console.debug("Setting up sse listeners");

      try {
        await Composition.staffDashboardRoomListener.subscribe(
          contest.id,
          {
            LEADERBOARD_UPDATED: receiveLeaderboardPartial,
            SUBMISSION_CREATED: receiveSubmission,
            SUBMISSION_UPDATED: receiveSubmission,
            ANNOUNCEMENT_CREATED: receiveAnnouncement,
            CLARIFICATION_PUBLISHED: receiveClarificationPublished,
            CONTEST_FROZEN: receiveContestFrozen,
            CONTEST_UNFROZEN: receiveContestUnfrozen,
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
        await Composition.staffDashboardRoomListener.unsubscribe();
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
    dispatch(StaffDashboardSlice.actions.mergeLeaderboard(leaderboard));
  }

  function receiveSubmission(submission: SubmissionWithCodeResponseDTO) {
    console.debug("Received submission:", submission);
    dispatch(StaffDashboardSlice.actions.mergeSubmission(submission));
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    console.debug("Received announcement:", announcement);
    dispatch(StaffDashboardSlice.actions.mergeAnnouncement(announcement));

    if (announcement.member.id !== session?.member.id) {
      toast.warning(`New announcement: ${announcement.text}`);
    }
  }

  function receiveClarificationPublished(
    clarification: ClarificationResponseDTO,
  ) {
    console.debug("Received clarification published:", clarification);
    dispatch(StaffDashboardSlice.actions.mergeClarification(clarification));
    toast.info(`A clarification has been published`);
  }

  function receiveContestFrozen(contest: ContestResponseDTO) {
    console.debug("Received contest frozen:", contest);
    dispatch(StaffDashboardSlice.actions.freeze(contest));
    toast.info("The contest has been frozen");
  }

  function receiveContestUnfrozen(data: {
    contest: ContestResponseDTO;
    leaderboard: LeaderboardResponseDTO;
    submissions: SubmissionWithCodeResponseDTO[];
  }) {
    console.debug("Received contest unfrozen");
    dispatch(StaffDashboardSlice.actions.unfreeze(data));
    toast.info("The contest has been unfrozen");
  }

  function receivePrintRequest(printRequest: PrintRequestResponseDTO) {
    console.debug("Received print request:", printRequest);
    dispatch(StaffDashboardSlice.actions.mergePrintRequest(printRequest));
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
