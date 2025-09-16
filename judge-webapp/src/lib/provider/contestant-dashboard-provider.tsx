import React, { useEffect } from "react";

import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  leaderboardService,
  listenerClientFactory,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";
import { ErrorPage } from "@/lib/component/page/error-page";
import { LoadingPage } from "@/lib/component/page/loading-page";
import { useIntl } from "@/lib/util/intl-hook";
import { useLoadableState } from "@/lib/util/loadable-state";
import { useToast } from "@/lib/util/toast-hook";
import { contestantDashboardSlice } from "@/store/slices/contestant-dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";

const messages = defineMessages({
  problemAnswer: {
    id: "lib.provider.contestant-dashboard-provider.problem-answer",
    defaultMessage: "Problem {letter}: {answer}",
  },
  announcement: {
    id: "lib.provider.contestant-dashboard-provider.announcement",
    defaultMessage: "New announcement: {text}",
  },
  clarificationAnswer: {
    id: "lib.provider.contestant-dashboard-provider.clarification-answer",
    defaultMessage: "New answer for a clarification",
  },
});

export function ContestantDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useAppSelector((state) => state.session);
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const state = useLoadableState({ isLoading: true });
  const dispatch = useAppDispatch();
  const toast = useToast();
  const intl = useIntl();

  useEffect(() => {
    state.start();
    const listenerClient = listenerClientFactory.create();

    async function fetch() {
      try {
        const data = await Promise.all([
          contestService.findContestById(contestMetadata.id),
          leaderboardService.findContestLeaderboard(contestMetadata.id),
          submissionService.findAllContestSubmissions(contestMetadata.id),
          submissionService.findAllFullForMember(contestMetadata.id),
        ]);

        await listenerClient.connect();
        await Promise.all([
          leaderboardListener.subscribeForLeaderboard(
            listenerClient,
            contestMetadata.id,
            receiveLeaderboard,
          ),
          submissionListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveSubmission,
          ),
          submissionListener.subscribeForMemberFull(
            listenerClient,
            contestMetadata.id,
            session!.member.id,
            receiveMemberSubmission,
          ),
          announcementListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveAnnouncement,
          ),
          clarificationListener.subscribeForContest(
            listenerClient,
            contestMetadata.id,
            receiveClarification,
          ),
          clarificationListener.subscribeForMemberChildren(
            listenerClient,
            contestMetadata.id,
            session!.member.id,
            receiveClarificationAnswer,
          ),
          clarificationListener.subscribeForContestDeleted(
            listenerClient,
            contestMetadata.id,
            deleteClarification,
          ),
        ]);

        dispatch(
          contestantDashboardSlice.actions.set({
            contest: data[0],
            leaderboard: data[1],
            submissions: data[2],
            memberSubmissions: data[3],
          }),
        );
        state.finish();
      } catch (error) {
        state.fail(error as Error);
      }
    }

    fetch();

    return () => {
      listenerClient.disconnect();
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

  return children;
}
